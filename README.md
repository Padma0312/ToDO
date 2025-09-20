# My To Do App

A simple, elegant to-do list application built with HTML, CSS, and JavaScript.

## Features

✅ **Add Tasks**: Create new main tasks using the input field
✅ **Add Subtasks**: Add smaller, related subtasks under any main task
✅ **AI-Powered Planning**: Use the "PlanForMe" feature to automatically generate subtasks using Azure AI
✅ **Edit Tasks**: Click on any task or subtask title to edit it inline
✅ **Mark Complete**: Check off tasks and subtasks when completed
✅ **Delete Tasks**: Remove unwanted tasks and subtasks with the delete button
✅ **Auto-Save**: All changes are automatically saved to your browser's local storage
✅ **Persistent Data**: Your tasks remain even after closing the browser or refreshing
✅ **AI Settings**: Secure storage of Azure AI credentials with connection testing

## How to Use

1. **Adding Tasks**: Type in the input field at the top and click "Add Task" or press Enter
2. **Adding Subtasks**: Click the "+ Subtask" button on any task, then type and press Enter
3. **AI Planning**: Click the purple "PlanForMe" button (🪄) to automatically generate subtasks using AI
4. **Editing**: Click on any task or subtask title to edit it inline
5. **Completing**: Click the checkbox next to any task or subtask to mark it as complete
6. **Deleting**: Click the "✕" button to delete tasks or subtasks (tasks require confirmation)
7. **Settings**: Click the "⚙️ Settings" button to configure your Azure AI credentials

### Setting up AI Features

1. Click the "⚙️ Settings" button in the top-right corner
2. Enter your Azure AI endpoint (e.g., `https://your-endpoint.openai.azure.com/`)
3. Enter your Azure AI API key
4. Enter your deployment name (default: `gpt-4`)
5. Click "Test Connection" to verify your settings
6. Click "Save Settings" to store your credentials securely

Once configured, you can use the "PlanForMe" button on any task to automatically generate relevant subtasks!

## Technical Details

- **HTML**: Semantic structure with accessibility considerations
- **CSS**: Modern styling with gradients, animations, and responsive design
- **JavaScript**: ES6+ class-based architecture with localStorage persistence
- **Storage**: Uses browser's localStorage for data persistence

## File Structure

```
To Do App/
├── index.html      # Main HTML structure
├── styles.css      # CSS styling and layout
├── script.js       # JavaScript functionality
└── README.md       # This documentation
```

## Browser Compatibility

Works in all modern browsers that support:
- ES6 Classes
- localStorage
- CSS Grid/Flexbox
- contenteditable attribute

## Getting Started

Simply open `index.html` in your web browser to start using the app!