import express, { Router, json } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import multer from "multer";
const app = express()
import { unlinkSync, existsSync } from 'fs';
import { connect } from 'mongoose';
import User, { findOne, findById, findByIdAndUpdate } from './models/user.model.js';
import pkg from 'body-parser';
const { json: _json } = pkg;
import token from 'jsonwebtoken';
const { sign, verify } = token;
import { uploadOnCloudinary } from './config/cloudinary.js';


import userRoutes from './routes/userRoutes.js';
app.use('/api', userRoutes);

app.options('*', cors());


const router = Router();
app.use(json());
app.use(_json());

// Middleware
// app.use(cors({
//   origin: ["https://flux-frontend-alpha.vercel.app"],
//   methods: ["POST", "GET"],
//   credentials: true
// }));

app.use(cors());

app.use('/api', router);


// Multer

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + '-' + file.originalname);
//     }
//   });
  
// const upload = multer({ storage });

const storage = multer.memoryStorage();
const upload = multer({ storage });


// Upload API for Profile Image

router.post('/api/profile-upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const localFilePath = req.file.path;
        const result = await uploadOnCloudinary(localFilePath);

        if (result) {
            // Update the user's document with the new profile image URL
            const userId = req.user.id; // Use the user ID from the token
            const user = await User.findById(userId);
            if (user) {
                user.profileImage = result.url; // Update profile image URL
                await user.save();
                res.status(200).json({ url: result.url });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } else {
            res.status(500).json({ error: 'Failed to upload to Cloudinary' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// Connecting to database

const uri = process.env.MONGODB_URL;

connect(uri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Function - authenticate token

const SECRET_KEY = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// Generate token

function generateToken(user) {
    return sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: '24h', 
    });
}


// Routes //

// Test
// app.post('/api/test', authenticateToken, async (req, res) => {
//     try {
//         const { test } = req.body;

//         const user = await findById(req.user.id);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         user.test = test;
//         await user.save();

//         res.status(200).json({ message: 'Text saved successfully', user });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });


// Testing
router.get('/api/create-user', async (req, res) => {
    try {
      const newUser = new User({
        firstName: 'Hello',
        lastName: 'Wahab',
        email: 'something@gmail.com',
        password: '545454',
        organization: 'Abdulify',
      });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
});

// Signup
// app.post('/api/signup', async (req, res) => {
//     try {
//         const { firstName, lastName, email, password, organization} = req.body;
//         const newUser = new User({ firstName, lastName, email, password, organization});
//         await newUser.save();
//         res.status(201).json(newUser);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// app.post('/api/signup', async (req, res) => {
//     try {
//         const { firstName, lastName, email, password, organization } = req.body;

//         // Define default goal entry
//         const defaultGoals = [
//             {
//                 text: 'Enter your goal',
//                 description: '',
//                 completed: false
//             }
//         ];

//         // Create a new user with default goals
//         const newUser = new User({
//             firstName,
//             lastName,
//             email,
//             password,
//             organization,
//             goals: defaultGoals // Assign default goals to the new user
//         });

//         // Save the new user to the database
//         await newUser.save();

//         // Respond with the newly created user
//         res.status(201).json(newUser);
//     } catch (error) {
//         // Handle errors and respond with an error message
//         res.status(400).json({ message: error.message });
//     }
// });

router.post('/api/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password, organization } = req.body;

        const defaultTask = [
            {
                text: 'Your first task',
                description: '',
                completed: false,
                status: 'backlog',
                dueDate: null,
                subtasks: []
            }
        ];

        // Define default goal entry
        const defaultGoals = [
            {
                text: 'Enter your first goal',
                description: '',
                completed: false
            }
        ];

        // Create a new user with default goals
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            organization,
            goals: defaultGoals, // Assign default goals to the new user
            pages: [], // Initialize pages array
            todayTasks: defaultTask
        });

        // Save the new user to the database
        const savedUser = await newUser.save();

        // Automatically create a new page for the user after signup
        const slug = 'first-page'; // Define the default slug, title, iconClass, and content for the new page
        const title = 'Your first page';
        const iconClass = 'fa-solid fa-home';
        const content = 'Welcome to your first page!';

        // Use findByIdAndUpdate to add the new page to the user's pages array
        const updatedUser = await User.findByIdAndUpdate(
            savedUser._id,
            { $push: { pages: { slug, title, iconClass, content } } },
            { new: true }
        );

        // Respond with the updated user
        res.status(201).json(updatedUser);
    } catch (error) {
        // Handle errors and respond with an error message
        res.status(400).json({ message: error.message });
    }
});

// Login
router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Directly compare passwords (not recommended for production)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Send token in response
        res.status(200).json({ token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Profile section - fetch and update user details

// Fetch user details
router.get('/api/user', authenticateToken, async (req, res) => {
    try {
        // Use the user ID from the token
        const user = await findById(req.user.id); // Ensure you use req.user.id or req.user._id depending on the token payload
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user details
router.put('/api/user', authenticateToken, async (req, res) => {
  try {
      const { firstName, lastName, email, password, organization } = req.body;

      const updatedUser = await findByIdAndUpdate(
          req.user.id, // Use req.user.id from the token payload
          { firstName, lastName, email, password, organization },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.json(updatedUser);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Route to get and save today tasks

// Get tasks
router.get('/api/today', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ tasks: user.todayTasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Save tasks
router.post('/api/today', authenticateToken, async (req, res) => {
    try {
        const { tasks } = req.body;

        // Validate the structure of tasks and subtasks
        if (!Array.isArray(tasks) || !tasks.every(task => 
            typeof task.text === 'string' &&
            typeof task.description === 'string' &&
            typeof task.completed === 'boolean' &&
            typeof task.status === 'string' &&
            (!task.dueDate || !isNaN(new Date(task.dueDate).getTime())) &&
            (!task.subtasks || (Array.isArray(task.subtasks) && task.subtasks.every(subtask => 
                typeof subtask.text === 'string' &&
                typeof subtask.completed === 'boolean'
            )))
        )) {
            return res.status(400).json({ message: 'Invalid tasks format' });
        }

        // Find the user by ID from the token
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's todayTasks with the new tasks data
        user.todayTasks = tasks;
        await user.save();

        res.json({ message: 'Tasks saved successfully', tasks: user.todayTasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start time tracking

router.post('/api/today/:id/start-tracking', authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;

        const task = await User.findOneAndUpdate(
            { _id: userId, 'todayTasks._id': taskId },
            { $set: { 'todayTasks.$.isTracking': true, 'todayTasks.$.lastStartTime': new Date() } },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Tracking started', task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/api/today/:id/stop-tracking', authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;

        const user = await User.findOne({ _id: userId, 'todayTasks._id': taskId });

        if (!user) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const task = user.todayTasks.id(taskId);
        const currentTime = new Date();
        const elapsedTime = Math.floor((currentTime - task.lastStartTime) / 1000);

        task.timeSpent += elapsedTime;
        task.isTracking = false;
        task.lastStartTime = null;

        await user.save();

        res.status(200).json({ message: 'Tracking stopped', task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Goals APIs


// Get goals
router.get('/api/goals', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ goals: user.goals });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Save goals
router.post('/api/goals', authenticateToken, async (req, res) => {
    try {
        const { goals } = req.body;

        // Validate the structure of goals and their properties
        if (!Array.isArray(goals) || !goals.every(goal => 
            typeof goal.text === 'string' &&
            typeof goal.description === 'string' &&
            typeof goal.completed === 'boolean'
        )) {
            return res.status(400).json({ message: 'Invalid goal format' });
        }

        // Find the user by ID from the token
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's goals with the new goals data
        user.goals = goals;
        await user.save();

        res.json({ message: 'Goals saved successfully', goals: user.goals });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// New page save

router.post('/api/new-page', authenticateToken, async (req, res) => {
    const { slug, title, iconClass, content } = req.body;

    try {
        
        // Use the user ID from the token payload
        const userId = req.user.id;

        // Use findByIdAndUpdate to add the new page to the user's pages array
        const updatedUser = await findByIdAndUpdate(
            userId,
            { $push: { pages: { slug, title, iconClass, content } } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Page created successfully', updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fetching api

router.get('/api/pages', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.pages); // Send back the user's pages
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Delete page

router.delete('/api/pages/:slug', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { slug } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out the page with the matching slug
        user.pages = user.pages.filter(page => page.slug !== slug);

        await user.save();

        res.status(200).json({ message: 'Page deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Fetch data for new page based on slug

router.get('/api/pages/:slug', authenticateToken, async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the page with the given slug
        const page = user.pages.find(page => page.slug === slug);

        if (page) {
            res.status(200).json(page);
        } else {
            res.status(404).json({ message: 'Page not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Backend API for updating new page content

router.put('/api/pages/:slug', authenticateToken, async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, content} = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const page = user.pages.find(page => page.slug === slug);
        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        // Update the page details
        page.title = title || page.title;
        page.content = content || page.content;

        // Save changes
        await user.save();

        res.status(200).json(page);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// API for fetching images

router.get('/api/pages/:slug/images', authenticateToken, async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the page with the given slug
        const page = user.pages.find(page => page.slug === slug);

        if (page) {
            // Check if images exist and return them
            if (page.images) {
                res.status(200).json({ images: page.images });
            } else {
                res.status(404).json({ message: 'No images found for this page' });
            }
        } else {
            res.status(404).json({ message: 'Page not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// API for saving page images

router.post('/api/pages/:slug/upload-image', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const page = user.pages.find(page => page.slug === slug);
        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        if (req.file) {
            const localFilePath = req.file.path;
            const result = await uploadOnCloudinary(localFilePath);

            // fs.unlinkSync(localFilePath);

            if (result) {
                page.images.push(result.url); // Update to the URL provided by Cloudinary
                await user.save(); // Save the user with updated page data

                res.status(200).json({ message: 'Image uploaded and saved successfully', imageUrl: page.images });
            } else {
                res.status(500).json({ message: 'Failed to upload to Cloudinary' });
            }
        } else {
            res.status(400).json({ message: 'No image file uploaded' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// app.post('/api/pages/:slug/upload-image', authenticateToken, upload.single('file'), async (req, res) => {
//     try {
//         const { slug } = req.params;
//         const userId = req.user.id;

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const page = user.pages.find(page => page.slug === slug);
//         if (!page) {
//             return res.status(404).json({ message: 'Page not found' });
//         }

//         if (req.file) {
//             // Upload the image to Cloudinary using the predefined function
//             const localFilePath = req.file.path;
//             const result = await uploadOnCloudinary(localFilePath);

//             // Remove the local file after upload
//             fs.unlinkSync(localFilePath);

//             if (result) {
//                 // Save the Cloudinary URL to the 'images' field
//                 if (!page.images) page.images = [];
//                 page.images.push(result.url);
//                 await user.save();

//                 res.status(200).json({ message: 'Image uploaded and saved successfully', imageUrl: page.images });
//             } else {
//                 res.status(500).json({ message: 'Failed to upload to Cloudinary' });
//             }
//         } else {
//             res.status(400).json({ message: 'No image file uploaded' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });

// Testing upcoming
router.get('/api/content', authenticateToken, async (req, res) => {
    try {
        // Find the user and return the content
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ content: user.upcoming || '{}' }); // Return content or empty JSON object
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Save content
router.post('/api/content', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        
        // Validate content (it should be a JSON string)
        if (typeof content !== 'string') {
            return res.status(400).json({ message: 'Invalid content format' });
        }

        // Find the user and update the content
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.upcoming = content;
        await user.save();

        res.json({ message: 'Content saved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
  
router.get('/flux', (req, res) => {
    res.send('Hello flux flux flux!')
})

router.get('/', (req, res) => {
    res.send('Hello there!')
})


app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})

export default router;
