import { sendMessage } from "./pusher";

import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "This method requires POST!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const { id, receiving_user_ids } = req.body;

  // groupIds are the ids of the group chats with all the receiving users,
  // that the current logged in user already has a group with
  const [error1, data1] = await getReceiversWithoutGroup(
    username,
    receiving_user_ids
  );
  if (error1) return res.status(data1.code).json(data1.err);
  const [receiversWithoutGroup, groupIds] = data1;

  let newGroupIds = [];
  if (receiversWithoutGroup.length > 0) {
    const [error2, data2] = await createGroupChats(
      username,
      receiversWithoutGroup
    );
    if (error2) return res.status(data2.code).json(data2.err);
    newGroupIds = data2;
  }

  const chatIds = [...groupIds, ...newGroupIds];
  const [error3, data3] = await saveMessageInGroupChats(username, chatIds, id);
  if (error3) return res.status(data3.code).json(data3.err);

  
  // send message in realtime to receiving users
  for (const chatId of chatIds) {
    await sendMessage(username, chatId, "incoming-message", {
      post_id: id,
      message_type: "post",
      created_at: new Date().toISOString(),
    });
  }

  res.status(200).json({ message: `Message sent!` });
}

async function getReceiversWithoutGroup(username, receiving_user_ids) {
  // check if for each receiving user, there is already a chat group created, just with this one user
  // returns list of user_ids that the user already has a chat with
  // => if id from receiving_user_ids not in result => create group chat
  const check_chat_groups_query = `
    SELECT
      MAX(
        CASE WHEN user_id <> (
          SELECT id FROM users
          WHERE username = ?
        ) THEN user_id END
      ) AS user_id,
      group_id
    FROM chat_group_members
    WHERE
      user_id = (
        SELECT id FROM users
        WHERE username = ?
      )
    OR
      user_id IN (?)
    GROUP BY group_id
    HAVING COUNT(DISTINCT user_id) = 2;
  `;

  const result = await executeQuery({
    query: check_chat_groups_query,
    values: [username, username, receiving_user_ids],
  });

  if (result.error) {
    console.log(result.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query!" },
    ];
  }

  const currentLoggedInUserAlreadyHasChatWith = result.map(
    ({ user_id }) => user_id
  );
  const groupIds = result.map(({ group_id }) => group_id);

  return [
    false,
    [
      receiving_user_ids.filter(
        (id) => !currentLoggedInUserAlreadyHasChatWith.includes(id)
      ),
      groupIds,
    ],
  ];
}

async function createGroupChats(username, receiving_user_ids) {
  // [1, 2, 3] => "(), (), ()"
  let placeholders = receiving_user_ids.map((id) => "()").join(", ");
  const createGroupQuery = `
    INSERT INTO chat_groups() VALUES ${placeholders};
  `;
  const createGroupResult = await executeQuery({
    query: createGroupQuery,
    values: [],
  });

  if (createGroupResult.error) {
    console.log(createGroupResult.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query!" },
    ];
  }

  const rowIds = receiving_user_ids.map(
    (id, idx) => createGroupResult.insertId + idx
  );

  // insert chat members
  placeholders = rowIds
    .map(
      () => `((
    SELECT id FROM users
    WHERE username = ?
  ), ?), (?, ?)`
    )
    .join(", ");

  const insertChatMembersQuery = `
    INSERT INTO chat_group_members(user_id, group_id)
    VALUES ${placeholders}
  `;
  const placeholderValues = rowIds
    .map((rowId, idx) => [username, rowId, receiving_user_ids[idx], rowId])
    .flat();

  const insertChatMembersResult = await executeQuery({
    query: insertChatMembersQuery,
    values: placeholderValues,
  });

  if (insertChatMembersResult.error) {
    console.log(insertChatMembersResult.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query!" },
    ];
  }

  return [false, rowIds];
}

async function saveMessageInGroupChats(username, groupIds, postId) {
  const placeholders = groupIds
    .map(
      () => `((
    SELECT id FROM users
    WHERE username = ?
  ), ?, "post", ?)`
    )
    .join(", ");

  const query = `
    INSERT INTO chat_messages(sender_user_id, group_id, message_type, post_id)
    VALUES ${placeholders}
  `;

  const placeholderValues = groupIds
    .map((groupId) => [username, groupId, postId])
    .flat();

  const result = await executeQuery({
    query,
    values: placeholderValues,
  });

  if (result.error) {
    console.log(result.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query!" },
    ];
  }

  return [false];
}
