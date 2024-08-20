import Post from '../Models/Post.js'
import User from '../Models/User.js'
import Comment from '../Models/Comment.js'
// import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
//npm i express-fileupload

import { dirname } from 'path';

import path from 'path';

export const createPost = async (req, res) => {
    try {
        console.log('Request body:', req.body); 
        const { title, text } = req.body;
        const user = await User.findById(req.userId);

        let imgUrl = '';

        if (req.files && req.files.image) {
            const image = req.files.image;
            console.log('Image:', image); 
            const fileName = Date.now().toString() + image.name;
            const __dirname = dirname(fileURLToPath(import.meta.url));
            const uploadPath = path.join(__dirname, '..', 'uploads', fileName);

            await image.mv(uploadPath);

            imgUrl = fileName;
        }

        console.log('Creating new post...'); 

        const newPost = new Post({
            username: user.username,
            title,
            text,
            imgUrl,
            author: req.userId,
        });

        await newPost.save();

        console.log('Updating user posts...'); 

        await User.findByIdAndUpdate(req.userId, {
            $push: { posts: newPost },
        });

        console.log('Post created successfully:', newPost); 

        res.json(newPost);
    } catch (error) {
        console.error('Error creating post:', error); 
        res.status(500).json({ message: 'Something went wrong.' });
    }
};


// Get All Posts
export const getAll = async (req, res) => {
    try {
        const posts = await Post.find().sort('-createdAt')
        const popularPosts = await Post.find().limit(5).sort('-views')

        if (!posts) {
            return res.json({ message: 'Постов нет' })
        }

        res.json({ posts, popularPosts })
    } catch (error) {
        res.json({ message: 'Something went wrong.' })
    }
}

// Get Post By Id
export const getById = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, {
            $inc: { views: 1 },
        })
        res.json(post)         
    } catch (error) {
        res.json({ message: 'Something went wrong.' })
    }
}

// Get All Posts
export const getMyPosts = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        const list = await Promise.all(
            user.posts.map((post) => {
                return Post.findById(post._id)
            }),
        )
        res.json(list)
    } catch (error) {
        res.json({ message: 'Something went wrong.' })
    }
}

// Remove post
export const removePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id)
        if (!post) return res.json({ message: 'There is no such post' })

        await User.findByIdAndUpdate(req.userId, {
            $pull: { posts: req.params.id },
        })

        res.json({ message: 'The post has been removed.' })
    } catch (error) {
        res.json({ message: 'Something went wrong.' })
    }
}

// Update post
export const updatePost = async (req, res) => {
    try {
        const { title, text, id } = req.body
        const post = await Post.findById(id)

        if (req.files) {
             
            let fileName = Date.now().toString() + '_' + req.files.image.name; 
    
           
            const __dirname = dirname(fileURLToPath(import.meta.url))
            req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName))
            post.imgUrl = fileName || ''
        }

        post.title = title
        post.text = text

        await post.save()

        res.json(post)
    } catch (error) {
        res.json({ message: 'Something went wrong.' })
    }
}

// Get Post Comments
export const getPostComments = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        const list = await Promise.all(
            post.comments.map((comment) => {
                return Comment.findById(comment)
            }),
        )
        res.json(list)
    } catch (error) {
        res.json({ message: 'Something went wrong.' })
    }
}

