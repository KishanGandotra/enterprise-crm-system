const express = require('express');

const router = express.Router();

const upload = require('../config/multer');

const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const {
  createOpportunity,
  getAllOpportunities,
  updateOpportunityStatus,
  assignOpportunity,
  addOpportunityNote,
  getOpportunityNotes,
  getActivityLogs,
  deleteOpportunity,
  updateOpportunity,
  uploadFile,
  getOpportunityFiles
} = require('../controllers/opportunityController');


router.post(
  '/create',
  verifyToken,
  isAdmin,
  createOpportunity
);

router.get(
  '/all',
  verifyToken,
  getAllOpportunities
);



router.get(
  '/activity/:id',
  verifyToken,
  getActivityLogs
);



router.put(
  '/status/:id',
  verifyToken,
  isAdmin,
  updateOpportunityStatus
);



router.put(
  '/assign/:id',
  verifyToken,
  isAdmin,
  assignOpportunity
);



router.post(
  '/note/:id',
  verifyToken,
  addOpportunityNote
);

router.get(
  '/notes/:id',
  verifyToken,
  getOpportunityNotes
);


router.delete(
  '/delete/:id',
  verifyToken,
  deleteOpportunity
);


router.put(
  '/update/:id',
  verifyToken,
  updateOpportunity
);


router.post(
  '/upload/:id',
  verifyToken,
  upload.single('file'),
  uploadFile
);


router.get(
  '/files/:id',
  verifyToken,
  getOpportunityFiles
);

module.exports = router;