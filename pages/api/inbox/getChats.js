import executeQuery from "../../../database/executeQuery";

import shuffle from "../../../lib/shuffle";

export async function getData(userId, lazyLoadIteration = 0) {
  const query = `
    SELECT
      chat_groups.id,
      chat_groups.name,
      latest_sender.username,
      latest_message.message_type,
      latest_message.value,
      latest_message.created_at
    FROM chat_groups
    INNER JOIN chat_group_members
      ON chat_groups.id = chat_group_members.group_id
    -- get the created_at time from the latest message in each group and append it to every chat group
    LEFT JOIN (
      SELECT 
          group_id, 
          MAX(created_at) AS max_created_at 
      FROM chat_messages 
      GROUP BY group_id
    ) AS latest_time
      ON chat_groups.id = latest_time.group_id
    -- get only the latest message (the message which has the same created_at time as the max_created_at time)
    LEFT JOIN chat_messages AS latest_message
      ON latest_time.group_id = latest_message.group_id
      AND latest_time.max_created_at = latest_message.created_at
    -- get the user information for the sender of the latest message (we want sender's username not id)
    INNER JOIN users AS latest_sender
      ON latest_message.sender_user_id = latest_sender.id
    WHERE chat_group_members.user_id = ?
    ORDER BY latest_message.created_at DESC
    LIMIT 10
    OFFSET ?;
    ;
  `;

  const result = await executeQuery({
    query,
    values: [userId, parseInt(lazyLoadIteration) * 10],
  });

  if (result.error) {
    console.log(result.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query" },
    ];
  }
  
  if (result.length === 0) return [false, []];

  // get chat group members (not currentloggedinuser from the group chat) so that profile pictures can get displayed
  const getGroupChatUsersQuery = `
    SELECT
      chat_groups.id,
      username
    FROM chat_groups
    INNER JOIN chat_group_members
      ON chat_groups.id = chat_group_members.group_id
    INNER JOIN users
      ON users.id = chat_group_members.user_id
    WHERE
      chat_groups.id IN (?)
    AND
      users.id != ?;
  `;
  const groupChatUsers = await executeQuery({
    query: getGroupChatUsersQuery,
    values: [result.map(({ id }) => id), userId],
  });
  if (groupChatUsers.error) {
    console.log(groupChatUsers.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query" },
    ];
  }
  for (let i = 0; i < result.length; i++) {
    result[i].group_members = shuffle(
      groupChatUsers
        .filter((chatMembers) => chatMembers.id === result[i].id)
        .map(({ username }) => username)
    );
  }
  
  return [false, JSON.parse(JSON.stringify(result))];
}

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });

  const { userId, lazyLoadIteration } = req.query;
  const [error, data] = await getData(userId, lazyLoadIteration);

  if (error) return res.status(data.code).json({ error: data.err });
  res.status(200).json(data);
}
