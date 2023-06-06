const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes.' });
    }
    const notes = JSON.parse(data);
    res.json(notes);
  });
});

app.post('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save note.' });
    }
    const notes = JSON.parse(data);
    const newNote = {
      id: generateUniqueId(),
      title: req.body.title,
      text: req.body.text,
    };
    notes.push(newNote);

    fs.writeFile(
      path.join(__dirname, '/db/db.json'),
      JSON.stringify(notes),
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to save note.' });
        }
        res.json(newNote);
      }
    );
  });
});

app.get('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes.' });
    }
    const notes = JSON.parse(data);
    const note = notes.find((note) => note.id === noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }
    res.json(note);
  });
});

app.put('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update note.' });
    }
    const notes = JSON.parse(data);
    const noteIndex = notes.findIndex((note) => note.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found.' });
    }
    const updatedNote = {
      ...notes[noteIndex],
      title: req.body.title,
      text: req.body.text,
    };
    notes[noteIndex] = updatedNote;

    fs.writeFile(
      path.join(__dirname, '/db/db.json'),
      JSON.stringify(notes),
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to update note.' });
        }
        res.json(updatedNote);
      }
    );
  });
});

app.delete('/api/notes/:id', (req, res) => {
  fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete note.' });
    }
    const notes = JSON.parse(data);
    const noteId = req.params.id;

    const updatedNotes = notes.filter((note) => note.id !== noteId);

    fs.writeFile(
      path.join(__dirname, '/db/db.json'),
      JSON.stringify(updatedNotes),
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to delete note.' });
        }
        res.sendStatus(204);
      }
    );
  });
});

function generateUniqueId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
