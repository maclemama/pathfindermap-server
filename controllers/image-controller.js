const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer  = require('multer')

// Set multer file storage folder
const upload = multer({ dest: 'public/images' })

// stream uploaded thumbnail by request
router.get('/:imageName', (req, res) => {
    const imageName = req.params.imageName
    const readStream = fs.createReadStream(`public/images/${imageName}`)
    readStream.pipe(res)
  })

module.exports = router;