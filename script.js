class TodoApp {
    constructor() {
        this.tasks = [];
        this.trashedTasks = [];
        this.taskCounter = 0;
        this.currentTab = 'active';
        this.apiSettings = {
            endpoint: '',
            apiKey: '',
            deploymentName: 'gpt-4'
        };
        this.catMessages = [
            "Purr-fect! Another task to tackle! 🐾",
            "Meow! You're really kitten around with productivity! 😸",
            "I'm feline good about this new task! 😺",
            "Paws-itive vibes for your new goal! 🐱",
            "You've got to be kitten me - another one? I love it! 😹",
            "Fur real? That's a great task! 🙀",
            "I'm not lion - you're on fire today! 🦁",
            "Claw-some! Let's get this done! 😼",
            "Whiskers crossed for your success! 🤞",
            "That's the cat's pajamas of productivity! 😻",
            "I'm pawsitively impressed by your ambition! 🐾",
            "Meow is the time to get things done! ⏰",
            "You're the cat's meow when it comes to planning! 🎵",
            "Fur-tunately, I'm here to cheer you on! 📣",
            "This task has me purring with excitement! 😸"
        ];
        this.init();
        this.loadFromStorage();
        this.loadApiSettings();
    }

    init() {
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.tasksContainer = document.getElementById('tasksContainer');
        this.trashContainer = document.getElementById('trashContainer');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeModal = document.querySelector('.close');
        this.apiEndpointInput = document.getElementById('apiEndpoint');
        this.apiKeyInput = document.getElementById('apiKey');
        this.deploymentNameInput = document.getElementById('deploymentName');
        this.testConnectionBtn = document.getElementById('testConnectionBtn');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.catContainer = document.getElementById('catContainer');
        this.speechBubble = document.getElementById('speechBubble');

        // Event listeners
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.clearAllBtn.addEventListener('click', () => this.clearAllTasks());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Settings modal event listeners
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeModal.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveApiSettings());
        this.testConnectionBtn.addEventListener('click', () => this.testConnection());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        this.render();
    }

    addTask() {
        const title = this.taskInput.value.trim();
        if (!title) return;

        const task = {
            id: ++this.taskCounter,
            title: title,
            completed: false,
            subtasks: []
        };

        this.tasks.push(task);
        this.taskInput.value = '';
        this.saveToStorage();
        this.render();
        
        // Show cute cat with AI-generated witty message about this specific task
        this.showCat(title);
    }

    addSubtask(taskId, subtaskTitle) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !subtaskTitle.trim()) return;

        const subtask = {
            id: Date.now(), // Simple ID generation for subtasks
            title: subtaskTitle.trim(),
            completed: false
        };

        task.subtasks.push(subtask);
        this.saveToStorage();
        this.render();
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveToStorage();
        this.render();
    }

    deleteSubtask(taskId, subtaskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.subtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
        this.saveToStorage();
        this.render();
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.completed = !task.completed;
        
        // If task is completed, move it to trash
        if (task.completed) {
            this.moveTaskToTrash(taskId);
        }
        
        this.saveToStorage();
        this.render();
    }

    moveTaskToTrash(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = this.tasks.splice(taskIndex, 1)[0];
        task.movedToTrashAt = new Date().toISOString();
        this.trashedTasks.push(task);
    }

    clearAllTasks() {
        if (this.tasks.length === 0) {
            alert('No tasks to clear!');
            return;
        }

        if (confirm(`Are you sure you want to move all ${this.tasks.length} active tasks to trash?`)) {
            // Mark all tasks as completed and move to trash
            this.tasks.forEach(task => {
                task.completed = true;
                task.movedToTrashAt = new Date().toISOString();
            });
            
            this.trashedTasks.push(...this.tasks);
            this.tasks = [];
            
            this.saveToStorage();
            this.render();
            
            // Show a success message
            alert(`${this.trashedTasks.length} tasks moved to trash!`);
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Show/hide containers
        if (tab === 'active') {
            this.tasksContainer.style.display = 'block';
            this.trashContainer.style.display = 'none';
        } else {
            this.tasksContainer.style.display = 'none';
            this.trashContainer.style.display = 'block';
        }
        
        this.render();
    }

    deleteTaskFromTrash(taskId) {
        this.trashedTasks = this.trashedTasks.filter(task => task.id !== taskId);
        this.saveToStorage();
        this.render();
    }

    restoreTaskFromTrash(taskId) {
        const taskIndex = this.trashedTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = this.trashedTasks.splice(taskIndex, 1)[0];
        task.completed = false;
        delete task.movedToTrashAt;
        this.tasks.push(task);
        
        this.saveToStorage();
        this.render();
    }

    toggleSubtaskComplete(taskId, subtaskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const subtask = task.subtasks.find(s => s.id === subtaskId);
        if (!subtask) return;

        subtask.completed = !subtask.completed;
        this.saveToStorage();
        this.render();
    }

    updateTaskTitle(taskId, newTitle) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.title = newTitle.trim();
        this.saveToStorage();
    }

    updateSubtaskTitle(taskId, subtaskId, newTitle) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const subtask = task.subtasks.find(s => s.id === subtaskId);
        if (!subtask) return;

        subtask.title = newTitle.trim();
        this.saveToStorage();
    }

    // Settings Management
    openSettings() {
        this.settingsModal.style.display = 'block';
        this.loadApiSettingsToForm();
    }

    closeSettings() {
        this.settingsModal.style.display = 'none';
        this.connectionStatus.style.display = 'none';
    }

    loadApiSettingsToForm() {
        this.apiEndpointInput.value = this.apiSettings.endpoint;
        this.apiKeyInput.value = this.apiSettings.apiKey;
        this.deploymentNameInput.value = this.apiSettings.deploymentName;
    }

    saveApiSettings() {
        this.apiSettings = {
            endpoint: this.apiEndpointInput.value.trim(),
            apiKey: this.apiKeyInput.value.trim(),
            deploymentName: this.deploymentNameInput.value.trim() || 'gpt-4'
        };
        
        // Simple encryption for API key (base64 encoding)
        const encryptedSettings = {
            endpoint: this.apiSettings.endpoint,
            apiKey: btoa(this.apiSettings.apiKey),
            deploymentName: this.apiSettings.deploymentName
        };
        
        localStorage.setItem('todoAppApiSettings', JSON.stringify(encryptedSettings));
        this.showStatus('Settings saved successfully!', 'success');
        
        setTimeout(() => {
            this.closeSettings();
        }, 1500);
    }

    loadApiSettings() {
        const settings = localStorage.getItem('todoAppApiSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.apiSettings = {
                endpoint: parsed.endpoint || '',
                apiKey: parsed.apiKey ? atob(parsed.apiKey) : '',
                deploymentName: parsed.deploymentName || 'gpt-4'
            };
        }
    }

    async testConnection() {
        if (!this.apiSettings.endpoint || !this.apiSettings.apiKey) {
            this.showStatus('Please enter both endpoint and API key', 'error');
            return;
        }

        this.showStatus('Testing connection...', 'loading');
        this.testConnectionBtn.disabled = true;

        try {
            const response = await this.callAzureAI('Test connection');
            if (response) {
                this.showStatus('Connection successful!', 'success');
            }
        } catch (error) {
            this.showStatus(`Connection failed: ${error.message}`, 'error');
        } finally {
            this.testConnectionBtn.disabled = false;
        }
    }

    showStatus(message, type) {
        this.connectionStatus.textContent = message;
        this.connectionStatus.className = `status-message ${type}`;
        this.connectionStatus.style.display = 'block';
    }

    // AI Integration
    async planForTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        if (!this.apiSettings.endpoint || !this.apiSettings.apiKey) {
            alert('Please configure your AI settings first by clicking the Settings button.');
            return;
        }

        const planButton = document.querySelector(`button[data-task-id="${taskId}"].plan-for-me-btn`);
        const originalText = planButton.innerHTML;
        planButton.innerHTML = '<span class="magic-wand">⏳</span> Planning...';
        planButton.disabled = true;

        try {
            const subtasks = await this.callAzureAI(task.title);
            if (subtasks && subtasks.length > 0) {
                // Add generated subtasks to the task
                subtasks.forEach(subtaskTitle => {
                    const subtask = {
                        id: Date.now() + Math.random(), // Ensure unique IDs
                        title: subtaskTitle.trim(),
                        completed: false
                    };
                    task.subtasks.push(subtask);
                });
                
                this.saveToStorage();
                this.render();
            }
        } catch (error) {
            console.error('AI Planning error:', error);
            alert(`AI Planning failed: ${error.message}`);
        } finally {
            planButton.innerHTML = originalText;
            planButton.disabled = false;
        }
    }

    async callAzureAI(taskText) {
        const prompt = `Break down this task into 5-10 actionable subtasks that will help accomplish the main goal. Return only a JSON array of strings, no additional text or formatting.

Task: "${taskText}"

Example response format: ["Subtask 1", "Subtask 2", "Subtask 3"]`;

        const endpoint = this.apiSettings.endpoint.endsWith('/') 
            ? this.apiSettings.endpoint.slice(0, -1) 
            : this.apiSettings.endpoint;
        
        const url = `${endpoint}/openai/deployments/${this.apiSettings.deploymentName}/chat/completions?api-version=2024-02-15-preview`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': this.apiSettings.apiKey
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that breaks down tasks into subtasks. Always respond with a valid JSON array of strings, nothing else.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API call failed: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        try {
            // Try to parse as JSON
            const subtasks = JSON.parse(content);
            if (Array.isArray(subtasks)) {
                return subtasks.slice(0, 10); // Limit to 10 subtasks
            } else {
                throw new Error('Response is not an array');
            }
        } catch (parseError) {
            // Fallback: try to extract subtasks from text
            const lines = content.split('\n').filter(line => line.trim());
            return lines.map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim()).slice(0, 10);
        }
    }

    async generateCatMessage(taskText) {
        // If no AI credentials, fall back to static messages
        if (!this.apiSettings.endpoint || !this.apiSettings.apiKey) {
            console.log('❌ No AI credentials configured. Endpoint:', !!this.apiSettings.endpoint, 'API Key:', !!this.apiSettings.apiKey);
            return this.getRandomStaticMessage();
        }

        console.log('🤖 Starting AI cat message generation for:', taskText);
        try {
            const prompt = `You are a cute, witty cat assistant in a to-do app. The user just added this task: "${taskText}"

Generate a short, clever, cat-themed response (15-35 words max) that:
- References the specific task in a witty way
- Uses cat puns, cat behavior, or feline humor
- Is encouraging and playful
- Includes appropriate cat emojis (🐾, 😸, 😺, 🐱, etc.)
- Sounds like something a clever cat would say

Examples:
- Task: "Buy groceries" → "Time to hunt for the finest treats! This cat approves of your meal planning prowess! 🐾🛒"
- Task: "Exercise" → "Ready to pounce into action? Even cats need their stretches and zoomies! 😸💪"
- Task: "Study for exam" → "Time to sharpen those claws... I mean study skills! You'll ace this like a cat landing on its feet! 🐾📚"

Respond with ONLY the cat message, no quotes or extra formatting.`;

            const endpoint = this.apiSettings.endpoint.endsWith('/') 
                ? this.apiSettings.endpoint.slice(0, -1) 
                : this.apiSettings.endpoint;
            
            const url = `${endpoint}/openai/deployments/${this.apiSettings.deploymentName}/chat/completions?api-version=2024-02-15-preview`;

            console.log('🌐 Making AI request to:', url);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiSettings.apiKey
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a witty cat assistant that makes clever, short responses about tasks. Always respond with just the cat message, no quotes. Include cat puns and emojis. Keep responses between 15-35 words.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 120,
                    temperature: 0.8
                })
            });

            if (!response.ok) {
                console.warn('❌ AI cat message API call failed. Status:', response.status);
                const errorText = await response.text();
                console.warn('Error details:', errorText);
                return this.getRandomStaticMessage();
            }

            const data = await response.json();
            console.log('✅ AI response received:', data);
            const aiMessage = data.choices[0].message.content.trim();
            
            // Clean up the message (remove quotes if present)
            const cleanMessage = aiMessage.replace(/^["']|["']$/g, '');
            
            // Validate the message isn't too long
            if (cleanMessage.length > 200) {
                console.warn('⚠️ AI message too long, using fallback. Length:', cleanMessage.length);
                return this.getRandomStaticMessage();
            }
            
            console.log('🎉 AI Cat Message generated successfully:', cleanMessage);
            return cleanMessage;
            
        } catch (error) {
            console.error('❌ AI cat message error:', error);
            return this.getRandomStaticMessage();
        }
    }

    getRandomStaticMessage() {
        return this.catMessages[Math.floor(Math.random() * this.catMessages.length)];
    }

    // Debug function to check AI settings
    debugAISettings() {
        console.log('🔍 Current AI Settings Debug:');
        console.log('Endpoint:', this.apiSettings.endpoint ? '✅ Set' : '❌ Not set');
        console.log('API Key:', this.apiSettings.apiKey ? '✅ Set' : '❌ Not set');
        console.log('Deployment:', this.apiSettings.deploymentName);
        
        if (this.apiSettings.endpoint && this.apiSettings.apiKey) {
            console.log('✅ AI should be working for cat messages');
        } else {
            console.log('❌ Missing AI credentials - using static messages');
        }
    }

    // Cute Cat Feature
    async showCat(taskText = null) {
        console.log('🐱 showCat() called with task:', taskText);
        
        // Debug AI settings
        this.debugAISettings();
        
        // Check if elements exist
        if (!this.catContainer || !this.speechBubble) {
            console.error('❌ Cat elements not found:', {
                catContainer: this.catContainer,
                speechBubble: this.speechBubble
            });
            return;
        }
        
        // Show cat container first
        console.log('🎬 Showing cat container');
        this.catContainer.classList.add('show');
        
        // Generate message (AI or fallback)
        let message;
        if (taskText && this.apiSettings.endpoint && this.apiSettings.apiKey) {
            console.log('🤖 Generating AI cat message for task:', taskText);
            message = await this.generateCatMessage(taskText);
        } else {
            if (!taskText) {
                console.log('📝 No task text provided, using static message');
            } else if (!this.apiSettings.endpoint || !this.apiSettings.apiKey) {
                console.log('🔑 No AI credentials configured, using static message');
            }
            message = this.getRandomStaticMessage();
        }
        
        console.log('💬 Final cat message:', message);
        this.speechBubble.textContent = message;
        
        // Add AI indicator if message was generated by AI
        if (taskText && this.apiSettings.endpoint && this.apiSettings.apiKey) {
            this.speechBubble.setAttribute('data-ai', 'true');
        } else {
            this.speechBubble.setAttribute('data-ai', 'false');
        }
        
        // Show speech bubble if not already shown
        if (!this.speechBubble.classList.contains('show')) {
            setTimeout(() => {
                console.log('💭 Showing speech bubble');
                this.speechBubble.classList.add('show');
            }, 300);
        }
        
        // Hide cat after 5 seconds (longer for AI messages)
        setTimeout(() => {
            console.log('👋 Hiding cat');
            this.hideCat();
        }, 5000);
    }
    
    hideCat() {
        console.log('🫥 hideCat() called');
        if (!this.speechBubble || !this.catContainer) return;
        
        this.speechBubble.classList.remove('show');
        setTimeout(() => {
            this.catContainer.classList.remove('show');
        }, 300);
    }

    saveToStorage() {
        localStorage.setItem('todoApp', JSON.stringify({
            tasks: this.tasks,
            trashedTasks: this.trashedTasks,
            taskCounter: this.taskCounter
        }));
    }

    loadFromStorage() {
        const data = localStorage.getItem('todoApp');
        if (data) {
            const parsed = JSON.parse(data);
            this.tasks = parsed.tasks || [];
            this.trashedTasks = parsed.trashedTasks || [];
            this.taskCounter = parsed.taskCounter || 0;
            this.render();
        }
    }

    render() {
        if (this.currentTab === 'active') {
            this.renderActiveTasks();
        } else {
            this.renderTrashTasks();
        }
    }

    renderActiveTasks() {
        if (this.tasks.length === 0) {
            this.tasksContainer.innerHTML = '<div class="empty-state">No active tasks. Add your first task above!</div>';
            return;
        }

        this.tasksContainer.innerHTML = this.tasks.map(task => this.renderActiveTask(task)).join('');
        this.attachActiveTaskEventListeners();
    }

    renderTrashTasks() {
        if (this.trashedTasks.length === 0) {
            this.trashContainer.innerHTML = '<div class="empty-state">No tasks in trash. Completed tasks will appear here.</div>';
            return;
        }

        this.trashContainer.innerHTML = this.trashedTasks.map(task => this.renderTrashTask(task)).join('');
        this.attachTrashTaskEventListeners();
    }

    renderActiveTask(task) {
        const subtasksHtml = task.subtasks.map(subtask => this.renderSubtask(task.id, subtask)).join('');
        
        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-header">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                           data-task-id="${task.id}">
                    <div class="task-title ${task.completed ? 'completed' : ''}" 
                         contenteditable="true" 
                         data-task-id="${task.id}">${task.title}</div>
                    <div class="task-actions">
                        <button class="plan-for-me-btn" data-task-id="${task.id}">
                            <span class="magic-wand">🪄</span> PlanForMe
                        </button>
                        <button class="add-subtask-btn" data-task-id="${task.id}">+ Subtask</button>
                        <button class="delete-task-btn" data-task-id="${task.id}">✕</button>
                    </div>
                </div>
                <div class="subtasks-container">
                    ${subtasksHtml}
                    <input type="text" class="add-subtask-input" data-task-id="${task.id}" 
                           placeholder="Add a subtask..." style="display: none;">
                </div>
            </div>
        `;
    }

    renderTrashTask(task) {
        const movedDate = new Date(task.movedToTrashAt).toLocaleDateString();
        
        return `
            <div class="task-item trash-task" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-title completed">${task.title}</div>
                    <div class="task-meta">Moved to trash: ${movedDate}</div>
                    <div class="task-actions">
                        <button class="restore-task-btn" data-task-id="${task.id}">↩️ Restore</button>
                        <button class="delete-forever-btn" data-task-id="${task.id}">🗑️ Delete Forever</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTask(task) {
        const subtasksHtml = task.subtasks.map(subtask => this.renderSubtask(task.id, subtask)).join('');
        
        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-header">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                           data-task-id="${task.id}">
                    <div class="task-title ${task.completed ? 'completed' : ''}" 
                         contenteditable="true" 
                         data-task-id="${task.id}">${task.title}</div>
                    <div class="task-actions">
                        <button class="plan-for-me-btn" data-task-id="${task.id}">
                            <span class="magic-wand">🪄</span> PlanForMe
                        </button>
                        <button class="add-subtask-btn" data-task-id="${task.id}">+ Subtask</button>
                        <button class="delete-task-btn" data-task-id="${task.id}">✕</button>
                    </div>
                </div>
                <div class="subtasks-container">
                    ${subtasksHtml}
                    <input type="text" class="add-subtask-input" data-task-id="${task.id}" 
                           placeholder="Add a subtask..." style="display: none;">
                </div>
            </div>
        `;
    }

    renderSubtask(taskId, subtask) {
        return `
            <div class="subtask-item" data-task-id="${taskId}" data-subtask-id="${subtask.id}">
                <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}
                       data-task-id="${taskId}" data-subtask-id="${subtask.id}">
                <div class="subtask-title ${subtask.completed ? 'completed' : ''}" 
                     contenteditable="true" 
                     data-task-id="${taskId}" 
                     data-subtask-id="${subtask.id}">${subtask.title}</div>
                <button class="delete-subtask-btn" 
                        data-task-id="${taskId}" 
                        data-subtask-id="${subtask.id}">✕</button>
            </div>
        `;
    }

    attachActiveTaskEventListeners() {
        // Task checkboxes
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                this.toggleTaskComplete(taskId);
            });
        });

        // Subtask checkboxes
        document.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                const subtaskId = parseInt(e.target.dataset.subtaskId);
                this.toggleSubtaskComplete(taskId, subtaskId);
            });
        });

        // Task title editing
        document.querySelectorAll('.task-title').forEach(title => {
            title.addEventListener('blur', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                this.updateTaskTitle(taskId, e.target.textContent);
            });
            
            title.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            });
        });

        // Subtask title editing
        document.querySelectorAll('.subtask-title').forEach(title => {
            title.addEventListener('blur', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                const subtaskId = parseInt(e.target.dataset.subtaskId);
                this.updateSubtaskTitle(taskId, subtaskId, e.target.textContent);
            });
            
            title.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            });
        });

        // Add subtask buttons
        document.querySelectorAll('.add-subtask-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                const input = document.querySelector(`input[data-task-id="${taskId}"].add-subtask-input`);
                
                if (input.style.display === 'none') {
                    input.style.display = 'block';
                    input.focus();
                } else {
                    input.style.display = 'none';
                }
            });
        });

        // PlanForMe buttons
        document.querySelectorAll('.plan-for-me-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                this.planForTask(taskId);
            });
        });

        // Add subtask inputs
        document.querySelectorAll('.add-subtask-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const taskId = parseInt(e.target.dataset.taskId);
                    const subtaskTitle = e.target.value.trim();
                    
                    if (subtaskTitle) {
                        this.addSubtask(taskId, subtaskTitle);
                        e.target.value = '';
                        e.target.style.display = 'none';
                    }
                }
            });

            input.addEventListener('blur', (e) => {
                setTimeout(() => {
                    e.target.style.display = 'none';
                }, 150);
            });
        });

        // Delete task buttons
        document.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTask(taskId);
                }
            });
        });

        // Delete subtask buttons
        document.querySelectorAll('.delete-subtask-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                const subtaskId = parseInt(e.target.dataset.subtaskId);
                this.deleteSubtask(taskId, subtaskId);
            });
        });
    }

    attachTrashTaskEventListeners() {
        // Restore task buttons
        document.querySelectorAll('.restore-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                this.restoreTaskFromTrash(taskId);
            });
        });

        // Delete forever buttons
        document.querySelectorAll('.delete-forever-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                if (confirm('Are you sure you want to permanently delete this task?')) {
                    this.deleteTaskFromTrash(taskId);
                }
            });
        });
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});