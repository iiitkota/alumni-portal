const fs = require('fs');
const path = require('path');
const Event = require('../models/Event');

async function renameFilesWithPostId(postId, files, savedImages) {
  for (const file of files) {
    if (file.filename.includes('temp_')) {
      const matchingImage = savedImages.find(img => img.filename === file.filename);
      if (!matchingImage) continue;

      const oldPath = path.join('uploads', 'events', file.filename);
      const newFilename = file.filename.replace('temp_', `${postId}_`);
      const newPath = path.join('uploads', 'events', newFilename);

      await fs.promises.rename(oldPath, newPath);

      await Event.updateOne(
        { _id: postId, 'images.uid': matchingImage.uid }, // safer match
        {
          $set: {
            'images.$.filename': newFilename,
            'images.$.path': `/uploads/events/${newFilename}`,
          },
        }
      );
    }
  }
}

module.exports = renameFilesWithPostId;

 