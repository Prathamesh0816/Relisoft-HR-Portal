import express from 'express';
import {
  getPosts, createPost, likePost, addComment,
  deletePost, pinPost, getFeed,
} from '../controllers/socialController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/feed', protect, getFeed);
router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comments', protect, addComment);
router.delete('/:id', protect, deletePost);
router.put('/:id/pin', protect, pinPost);

export default router;
