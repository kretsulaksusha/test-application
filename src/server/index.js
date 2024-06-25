const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Uploaded documents dir and possible extensions
const documentsDir = path.join(__dirname, '../data/documents');
const extensions = ['.pdf', '.doc', '.docx'];

// Middleware
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../data/documents/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filename = file.originalname.split(".")[0];

        fs.readdir(documentsDir, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return res.status(500).send('Internal server error');
            }
            const matchingFiles = files.filter(file => file.startsWith(filename));
            matchingFiles.forEach(file => {
                const filePath = path.join(documentsDir, file);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    }
                });
            });
        });
        cb(null, true);
    }
});

app.use(cors());
app.use('/documents', express.static(documentsDir));

app.post('/upload-applications', upload.single('file'), (req, res) => {
    const data = req.body.data;

    fs.writeFile('../data/applications.json', JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving data');
        }

        res.send('Data saved successfully');
    });
});

app.post('/upload-clients', upload.single('data'), (req, res) => {
    const data = req.body.data;

    fs.writeFile('../data/clients.json', JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving data');
        }

        res.send('Data saved successfully');
    });
});

app.get('/documents/:id', (req, res) => {
    const fileId = req.params.id;
    const filePath = extensions.map(ext => path.join(documentsDir, `${fileId}${ext}`)).find(fs.existsSync);
    if (filePath) {
        res.sendFile(filePath);
    } else {
        res.status(200).json({ message: 'File not found' });
    }
});

app.post('/documents/:id/delete', (req, res) => {
    const fileId = req.params.id;
    const filePath = extensions.map(ext => path.join(documentsDir, `${fileId}${ext}`)).find(fs.existsSync);
    if (filePath) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(500).send('Error deleting file');
            }
            res.send('File deleted successfully');
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
