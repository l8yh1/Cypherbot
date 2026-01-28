// Use global.nameLocks to share data between commands
if (!global.nameLocks) global.nameLocks = new Map();
const lockedNames = global.nameLocks;

module.exports.config = {
  name: "nm",
  version: "1.2.0",
  permission: 1,
  credits: "you",
  prefix: true,
  description: "Lock group name",
  category: "admin",
  usages: "nm [name]",
  cooldowns: 5
};

module.exports.onLoad = function () {
  setInterval(async () => {
    if (!global.client?.api) return;

    for (const [threadID, lockedName] of lockedNames.entries()) {
      try {
        const info = await global.client.api.getThreadInfo(threadID);
        if (info.threadName !== lockedName) {
          await global.client.api.setTitle(lockedName, threadID);
        }
      } catch (e) {}
    }
  }, 5000);
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;

  const senderID = event.senderID;

  const botAdmins = [
    ...(global.config.ADMINBOT || []),
    ...(global.config.OPERATOR || []),
    ...(global.config.OWNER || [])
  ].map(String);

  if (!botAdmins.includes(String(senderID))) {
    return api.sendMessage("❌ Bot admins only.", event.threadID);
  }

  const name = args.join(" ");
  if (!name) {
    return api.sendMessage("⚠️ Usage: nm [name]", threadID);
  }

  await api.setTitle(name, threadID);
  lockedNames.set(threadID, name);

  api.sendMessage(`🔒 Group name locked:\n${name}`, threadID);
};
