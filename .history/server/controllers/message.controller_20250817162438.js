const Message = require('../models/message.model');
const Chat = require('../models/chat.model');
const { uploadToCloudinary } = require('../utils/cloudinary');

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const sender = req.user._id;

    let media = [];
    if (req.files) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file);
        media.push({
          url: result.secure_url,
          type: result.resource_type,
          name: file.originalname,
          size: result.bytes,
        });
      }
    }

    const message = new Message({
      sender,
      chat: chatId,
      content,
      media,
    });

    await message.save();

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    // Populate sender
    await message.populate('sender', 'name profilePicture mobile');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message.readBy.includes(req.user._id)) {
      message.readBy.push(req.user._id);
      await message.save();
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};