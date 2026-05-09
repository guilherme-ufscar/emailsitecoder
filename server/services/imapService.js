const { ImapFlow } = require('imapflow')

function makeClient(user) {
  return new ImapFlow({
    host: user.imap_host,
    port: user.imap_port,
    secure: user.imap_secure === 1,
    auth: { user: user.email, pass: user._password },
    logger: false,
    tls: { rejectUnauthorized: false },
  })
}

async function listFolders(user) {
  const client = makeClient(user)
  await client.connect()
  const list = await client.list()
  await client.logout()
  return list.map(f => ({ path: f.path, name: f.name, flags: [...f.flags] }))
}

async function listMessages(user, folder, page = 1, limit = 50) {
  const client = makeClient(user)
  await client.connect()
  const lock = await client.getMailboxLock(folder)
  try {
    const total = client.mailbox.exists
    const start = Math.max(1, total - (page * limit) + 1)
    const end = Math.max(1, total - ((page - 1) * limit))
    if (total === 0) return { messages: [], total: 0 }
    const messages = []
    for await (const msg of client.fetch(`${start}:${end}`, {
      uid: true, flags: true, envelope: true, bodyStructure: true,
    })) {
      messages.push({
        uid: msg.uid,
        flags: [...msg.flags],
        subject: msg.envelope.subject,
        from: msg.envelope.from,
        to: msg.envelope.to,
        date: msg.envelope.date,
        hasAttachment: msg.bodyStructure?.childNodes?.length > 1,
      })
    }
    return { messages: messages.reverse(), total }
  } finally {
    lock.release()
    await client.logout()
  }
}

async function fetchMessage(user, folder, uid) {
  const client = makeClient(user)
  await client.connect()
  const lock = await client.getMailboxLock(folder)
  try {
    const msg = await client.fetchOne(`${uid}`, {
      uid: true, flags: true, envelope: true, bodyStructure: true,
      source: true,
    }, { uid: true })
    if (!msg) return null

    // Mark as seen
    await client.messageFlagsAdd(`${uid}`, ['\Seen'], { uid: true })

    // Parse body parts
    let html = '', text = '', attachments = []
    async function parsePart(node, partPath) {
      if (node.type === 'text/html') {
        const buf = await client.download(partPath || '1', undefined, { uid: true })
        const chunks = []
        for await (const chunk of buf.content) chunks.push(chunk)
        html = Buffer.concat(chunks).toString('utf8')
      } else if (node.type === 'text/plain' && !html) {
        const buf = await client.download(partPath || '1', undefined, { uid: true })
        const chunks = []
        for await (const chunk of buf.content) chunks.push(chunk)
        text = Buffer.concat(chunks).toString('utf8')
      } else if (node.disposition === 'attachment') {
        attachments.push({
          partId: node.part || partPath,
          filename: node.parameters?.name || node.dispositionParameters?.filename || 'attachment',
          type: node.type,
          size: node.size,
        })
      }
      if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
          await parsePart(node.childNodes[i], node.childNodes[i].part)
        }
      }
    }
    await parsePart(msg.bodyStructure, msg.bodyStructure.part)

    return {
      uid: msg.uid,
      flags: [...msg.flags],
      envelope: msg.envelope,
      html,
      text,
      attachments,
    }
  } finally {
    lock.release()
    await client.logout()
  }
}

async function moveMessage(user, folder, uid, destination) {
  const client = makeClient(user)
  await client.connect()
  const lock = await client.getMailboxLock(folder)
  try {
    await client.messageMove(`${uid}`, destination, { uid: true })
  } finally {
    lock.release()
    await client.logout()
  }
}

async function deleteMessage(user, folder, uid) {
  const client = makeClient(user)
  await client.connect()
  const lock = await client.getMailboxLock(folder)
  try {
    if (folder.toLowerCase() === 'trash') {
      await client.messageDelete(`${uid}`, { uid: true })
    } else {
      await client.messageMove(`${uid}`, 'Trash', { uid: true })
    }
  } finally {
    lock.release()
    await client.logout()
  }
}

async function setReadFlag(user, folder, uid, read) {
  const client = makeClient(user)
  await client.connect()
  const lock = await client.getMailboxLock(folder)
  try {
    if (read) {
      await client.messageFlagsAdd(`${uid}`, ['\Seen'], { uid: true })
    } else {
      await client.messageFlagsRemove(`${uid}`, ['\Seen'], { uid: true })
    }
  } finally {
    lock.release()
    await client.logout()
  }
}

async function searchMessages(user, query) {
  const client = makeClient(user)
  await client.connect()
  const lock = await client.getMailboxLock('INBOX')
  try {
    const uids = await client.search({ or: [{ subject: query }, { from: query }, { body: query }] })
    const messages = []
    if (uids.length > 0) {
      const range = uids.slice(-50).join(',')
      for await (const msg of client.fetch(range, { uid: true, envelope: true, flags: true })) {
        messages.push({
          uid: msg.uid,
          flags: [...msg.flags],
          subject: msg.envelope.subject,
          from: msg.envelope.from,
          date: msg.envelope.date,
          folder: 'INBOX',
        })
      }
    }
    return messages.reverse()
  } finally {
    lock.release()
    await client.logout()
  }
}

async function appendToSent(user, rawMessage) {
  const client = makeClient(user)
  await client.connect()
  try {
    await client.append('Sent', rawMessage, ['\Seen'])
  } catch {
    // Sent folder may have different name — ignore append failure
  } finally {
    await client.logout()
  }
}

async function downloadAttachment(user, folder, uid, partId) {
  const client = makeClient(user)
  await client.connect()
  const lock = await client.getMailboxLock(folder)
  try {
    const dl = await client.download(`${uid}`, partId, { uid: true })
    const chunks = []
    for await (const chunk of dl.content) chunks.push(chunk)
    return { buffer: Buffer.concat(chunks), type: dl.type }
  } finally {
    lock.release()
    await client.logout()
  }
}

module.exports = {
  listFolders, listMessages, fetchMessage, moveMessage,
  deleteMessage, setReadFlag, searchMessages, appendToSent, downloadAttachment,
}
