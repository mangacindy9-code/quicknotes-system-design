const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// DOM Elements
const loadBtn = document.getElementById('load-btn');
const submitBtn = document.getElementById('submit-btn');
const noteForm = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const notesList = document.getElementById('notes-list');
const statusDiv = document.getElementById('status');

/**
 * Reusable async function to execute HTTP requests safely using fetch.
 */
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP Error! Status: ${response.status}`);
  }
  // Handle empty 204 No Content response for DELETE
  if (response.status === 204 || response.status === 200 && options.method === 'DELETE') {
    return { status: response.status, data: null };
  }
  const data = await response.json();
  return { status: response.status, data };
}

/**
 * Helper to display UI status messages safely.
 */
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status-${type}`;
}

/**
 * Helper to toggle button states during API requests.
 */
function setButtonsDisabled(disabled) {
  loadBtn.disabled = disabled;
  submitBtn.disabled = disabled;
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(btn => (btn.disabled = disabled));
}

/**
 * Render empty state when list has no notes.
 */
function renderEmptyState(message = 'No notes found. Click "Load Notes" or create a new note.') {
  notesList.innerHTML = '';
  const li = document.createElement('li');
  li.className = 'empty-state';
  li.textContent = message;
  notesList.appendChild(li);
}

/**
 * Creates a note DOM element using textContent to prevent XSS.
 */
function createNoteElement(note) {
  const li = document.createElement('li');
  li.className = 'note-item';
  li.dataset.id = note.id;

  const headerDiv = document.createElement('div');
  headerDiv.className = 'note-header';

  const h3 = document.createElement('h3');
  h3.className = 'note-title';
  h3.textContent = note.title; // Safe text insertion

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.type = 'button';
  deleteBtn.addEventListener('click', () => deleteNote(note.id, li));

  headerDiv.appendChild(h3);
  headerDiv.appendChild(deleteBtn);

  const p = document.createElement('p');
  p.className = 'note-body';
  p.textContent = note.body || '(No body content)'; // Safe text insertion

  li.appendChild(headerDiv);
  li.appendChild(p);

  return li;
}

/**
 * Task 1: Load 10 notes via GET
 */
async function loadNotes() {
  setButtonsDisabled(true);
  showStatus('Loading notes...', 'loading');

  try {
    const { data } = await request(`${API_URL}?_limit=10`);
    notesList.innerHTML = '';

    if (data.length === 0) {
      renderEmptyState('No notes available on the server.');
      showStatus('Loaded 0 notes from the server.', 'success');
    } else {
      data.forEach(note => {
        notesList.appendChild(createNoteElement(note));
      });
      showStatus(`Loaded ${data.length} notes from the server.`, 'success');
    }
  } catch (error) {
    showStatus(`Failed to load notes: ${error.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

/**
 * Task 2: Create a note via POST
 */
async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  // Front-end Validation
  if (!title) {
    showStatus('Validation Error: Note title is required.', 'error');
    return;
  }

  if (title.length > 100) {
    showStatus('Validation Error: Note title cannot exceed 100 characters.', 'error');
    return;
  }

  setButtonsDisabled(true);
  showStatus('Creating note...', 'loading');

  try {
    const payload = { title, body, userId: 1 };
    const { status, data } = await request(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Remove empty state if present
    if (notesList.querySelector('.empty-state')) {
      notesList.innerHTML = '';
    }

    // Prepend newly created note to top of list
    const newNoteElement = createNoteElement(data);
    notesList.insertBefore(newNoteElement, notesList.firstChild);

    showStatus(`Note created (status ${status}, id ${data.id}).`, 'success');
    noteForm.reset();
  } catch (error) {
    showStatus(`Failed to create note: ${error.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

/**
 * Task 3: Delete a note via DELETE
 * NOTE ON JSONPLACEHOLDER BEHAVIOR:
 * JSONPlaceholder is a mock REST API. Sending a DELETE request returns 200/204
 * but does not actually modify the mock backend database. Therefore, for local items 
 * or fetched items, we send the DELETE request to simulate the API call, and then 
 * manually remove the element from the DOM upon success.
 */
async function deleteNote(id, noteElement) {
  setButtonsDisabled(true);
  showStatus(`Deleting note #${id}...`, 'loading');

  try {
    await request(`${API_URL}/${id}`, { method: 'DELETE' });
    
    // Remove element from UI upon successful response
    noteElement.remove();

    if (notesList.children.length === 0) {
      renderEmptyState();
    }

    showStatus(`Note #${id} successfully deleted.`, 'success');
  } catch (error) {
    showStatus(`Failed to delete note #${id}: ${error.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

// Event Listeners
loadBtn.addEventListener('click', loadNotes);
noteForm.addEventListener('submit', createNote);

// Initial empty state on page render
renderEmptyState();
