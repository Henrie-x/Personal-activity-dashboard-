    const totalCount = document.getElementById("totalCount");
    const completedCount = document.getElementById("completedCount");
    const pendingCount = document.getElementById("pendingCount");
    const completionRate = document.getElementById("completionRate");
    
    const progressFill = document.getElementById("progressFill");
    const progressLabel = document.getElementById("progressLabel");
    
    const taskFormContainer = document.getElementById("taskFormContainer");
    const taskForm = document.getElementById("taskForm");
    const taskInput = document.getElementById("taskInput");
    const priorityInput = document.getElementById("priorityInput");
    
    const taskList = document.getElementById("taskList");
    const taskBadge = document.getElementById("taskBadge");
    
    const openForm = document.getElementById("openForm");
    const closeForm = document.getElementById("closeForm");
    const cancelForm = document.getElementById("cancelForm");
    const saveBtn = document.getElementById("saveBtn")
    
    const searchInput = document.getElementById("searchInput");
    const filterSelect = document.getElementById("filterSelect");
    
    let KEY = "task"
    let tasks = JSON.parse(localStorage.getItem(KEY)) || []
    let editingId = null
    
    
    function saveTasks() {
        localStorage.setItem(KEY,JSON.stringify(tasks))
    }
    
    taskForm.addEventListener("submit",(e) => {
        e.preventDefault()
        
        let textInt = taskInput.value.trim()
        let proInt = priorityInput.value
        
        if(!textInt) return;
        
        if(editingId) {
            tasks = tasks.map(tsk => {
                if(tsk.id === editingId) {
                    return {
                        ...tsk,
                        text: textInt,
                        priority: proInt
                    }
                }else {
                    return tsk
                }
            })
            editingId = null
        }else {
            let task = {
                text: textInt,
                priority: proInt,
                completed: false,
                createdAt: Date.now(),
                id: crypto.randomUUID()
            }
            
            tasks.push(task)
        }
        
        saveTasks()
        render()
        
        taskInput.value = ""
        priorityInput.value = "medium priority"
        saveBtn.textContent = "Add Tasks"
        taskFormContainer.classList.add("hidden")
    })
    
    function updateCounters() {
        let completed = tasks.filter(tsk => tsk.completed)
        let pending = tasks.filter(tsk => !tsk.completed)
        let progress = tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100)
        
        totalCount.textContent = tasks.length
        completedCount.textContent = completed.length
        pendingCount.textContent = pending.length
        completionRate.textContent = `${progress}%`
        progressFill.style.width = `${progress}%`
        progressLabel.textContent = `${completed.length} of ${tasks.length} completed`
    }
    
    function render() {
        updateCounters()
        
        let filtered = tasks
        
        if(filterSelect.value === "pending") {
            filtered = filtered.filter(tsk => !tsk.completed)
        }
        
        if(filterSelect.value === "completed") {
            filtered = filtered.filter(tsk => tsk.completed)
        }
        
        const searchText = searchInput.value.trim().toLowerCase()
        
        if(searchText !== "") {
            filtered = filtered.filter(tsk => tsk.text.toLowerCase().includes(searchText));
        }
        
        taskBadge.textContent = `${filtered.length} tasks`
        
        //taskList.innerHTML = ""
        
        if(filtered.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state" id="emptyState">
                  <h3>${tasks.length === 0 ? "No activities yet" : "No matching tasks"}</h3>
                  <p>${tasks.length === 0
                        ? "Your tasks will appear here once you create one."
                        : "Try another search or change your filter."}</p>
                </div>
            `
            return
        }
        
        taskList.innerHTML = filtered.map(task => {
            return (
                `
                    <article class="task-item ${task.completed ? "completed" : ""}" data-id="${task.id}">
                    
                      <label class="task-check">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
                        <span class="checkmark"></span>
                      </label>
                    
                      <div class="task-content">
                        <div class="task-title-row">
                          <h3>${task.text}</h3>
                          <span class="priority ${task.priority}">${task.priority}</span>
                        </div>
                    
                        <div class="task-details">
                          <span class="task-status">${task.completed ? "completed" : "pending"}</span>
                          <span class="task-separator"></span>
                          <time>${task.createdAt ? new Date(task.createdAt).toLocaleString(): "just Now"}</time>
                        </div>
                      </div>
                    
                      <div class="task-menu">
                        <button class="edit-task">Edit</button>
                        <button class="delete-task">Delete</button>
                      </div>
                    
                    </article>
                `
            )
        }).join("")
    }
    
    taskList.addEventListener("click",(e) => {
        const checkbox = e.target.closest(".task-checkbox");
        
        if (checkbox) {
            const article = checkbox.closest("article");
            if (!article) return;
            
            const id = article.dataset.id;
            
            tasks = tasks.map(task => {
                if(task.id === id) {
                    return {
                        ...task,
                        completed: checkbox.checked
                    }
                }else {
                    return task
                }
            })
            
            saveTasks();
            render();
            return;
        }
        
        const btn = e.target.closest("button")
        if(!btn) return;
        
        const article= btn.closest("article")
        if(!article) return;
        
        const id = article.dataset.id
        
        if(btn.classList.contains("delete-task")) {
            tasks = tasks.filter(tsk => tsk.id !== id)
            saveTasks()
            render()
        }
        
        if(btn.classList.contains("edit-task")) {
            const taskToEdit = tasks.find(tsk => tsk.id === id)
            
            if(!taskToEdit) return;
            
            taskInput.value = taskToEdit.text
            priorityInput.value = taskToEdit.priority
            
            editingId = id
            saveBtn.textContent = "Save Changes"
            taskFormContainer.classList.remove("hidden")
            taskInput.focus()
            return;
        }
    })
    
    render()
    
    
    openForm.addEventListener("click",(e) => {
        taskFormContainer.classList.remove("hidden")
        resetForm()
    })
    
    closeForm.addEventListener("click",() => {
        taskFormContainer.classList.add("hidden")
        resetForm()
    })
    
    cancelForm.addEventListener("click",() => {
        taskFormContainer.classList.add("hidden")
        resetForm()
    })
    
    filterSelect.addEventListener("change", () => {
        render();
    });

    searchInput.addEventListener("input", () => {
        render();
    });
    
    function resetForm() {
        editingId = null;
        taskInput.value = "";
        priorityInput.value = "medium priority";
        saveBtn.textContent = "Add task";
    }