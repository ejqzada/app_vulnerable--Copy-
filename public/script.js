document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const loginSection = document.getElementById('login-section');
    const postsSection = document.getElementById('posts-section');
    const postDetailSection = document.getElementById('post-detail-section');
    const createPostSection = document.getElementById('create-post-section');
    
    const loginForm = document.getElementById('login-form');
    const createPostForm = document.getElementById('create-post-form');
    const commentForm = document.getElementById('comment-form');
    
    const postsContainer = document.getElementById('posts-container');
    const postDetailContainer = document.getElementById('post-detail-container');
    const commentsContainer = document.getElementById('comments-container');
    
    const loginMessage = document.getElementById('login-message');
    const createPostMessage = document.getElementById('create-post-message');
    
    // Navegación
    const homeLink = document.getElementById('home-link');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const createPostLink = document.getElementById('create-post-link');
    const backToPosts = document.getElementById('back-to-posts');
    
    // Estado de la aplicación
    let currentUser = null;
    let currentPostId = null;
    
    // Verificar si el usuario está autenticado al cargar la página
    checkAuthentication();
    
    // Event Listeners
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPostsSection();
    });
    
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginSection();
    });
    
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    createPostLink.addEventListener('click', (e) => {
        e.preventDefault();
        showCreatePostSection();
    });
    
    backToPosts.addEventListener('click', (e) => {
        e.preventDefault();
        showPostsSection();
    });
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });
    
    createPostForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createPost();
    });
    
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addComment();
    });

    // Nuevo listener para la delegación de eventos en los posts
    postsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-post-btn')) {
            const postId = e.target.getAttribute('data-id');
            viewPost(postId);
        }
        if (e.target.classList.contains('delete-post-btn')) {
            const postId = e.target.getAttribute('data-id');
            deletePost(postId);
        }
    });

    // Nuevo listener para los botones dentro de la vista de un solo post
    postDetailContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-post-btn')) {
            const postId = e.target.getAttribute('data-id');
            deletePost(postId);
        }
    });

    // Funciones de autenticación
    async function checkAuthentication() {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                const data = await response.json();
                currentUser = data.user;
                updateUI();
                showPostsSection();
                loadPosts();
            } else {
                showLoginSection();
            }
        } catch (error) {
            console.error('Error al verificar autenticación:', error);
            showLoginSection();
        }
    }
    
    async function login() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                currentUser = data.user;
                updateUI();
                showPostsSection();
                loadPosts();
                showMessage(loginMessage, 'Login exitoso', 'success');
            } else {
                showMessage(loginMessage, data.error, 'error');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            showMessage(loginMessage, 'Error al iniciar sesión', 'error');
        }
    }
    
    async function logout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
            currentUser = null;
            updateUI();
            showLoginSection();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }
    
   // Funciones de UI
    function updateUI() {
    if (currentUser) {
        // Si hay un usuario logueado, oculta el link de login y muestra el de logout
        loginLink.style.display = 'none';
        logoutLink.style.display = 'inline-block';
        
        // Muestra el botón para crear post si hay un usuario logueado
        createPostLink.style.display = 'inline-block';
    } else {
        // Si no hay usuario, muestra el link de login y oculta los otros
        loginLink.style.display = 'inline-block';
        logoutLink.style.display = 'none';
        createPostLink.style.display = 'none';
    }
}

    function showLoginSection() {
        loginSection.style.display = 'block';
        postsSection.style.display = 'none';
        postDetailSection.style.display = 'none';
        createPostSection.style.display = 'none';
    }
    
    function showPostsSection() {
        loginSection.style.display = 'none';
        postsSection.style.display = 'block';
        postDetailSection.style.display = 'none';
        createPostSection.style.display = 'none';
        loadPosts();
    }
    
    function showPostDetailSection() {
        loginSection.style.display = 'none';
        postsSection.style.display = 'none';
        postDetailSection.style.display = 'block';
        createPostSection.style.display = 'none';
    }
    
    function showCreatePostSection() {
        loginSection.style.display = 'none';
        postsSection.style.display = 'none';
        postDetailSection.style.display = 'none';
        createPostSection.style.display = 'block';
    }
    
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = type;
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
    
    // Funciones de posts
    async function loadPosts() {
        try {
            const response = await fetch('/api/posts');
            const posts = await response.json();
            
            postsContainer.textContent = '';
            
            posts.forEach(post => {
                const postCard = createPostCard(post);
                postsContainer.appendChild(postCard);
            });
        } catch (error) {
            console.error('Error al cargar posts:', error);
        }
    }
    
    function createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'post-card';
        
        const date = new Date(post.date).toLocaleString();
        
        card.innerHTML = `
            <h3>${post.title}</h3>
            <div class="post-meta">Por ${post.author} - ${date}</div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <button class="view-post-btn" data-id="${post.id}">Ver Detalles</button>
                ${currentUser && currentUser.role === 'admin' ? `<button class="delete-post-btn" data-id="${post.id}">Eliminar</button>` : ''}
            </div>
        `;
        
        return card;
    }
    
    async function viewPost(postId) {
        currentPostId = postId;
        
        try {
            const response = await fetch(`/api/posts/${postId}`);
            const post = await response.json();
            
            postDetailContainer.innerHTML = `
                <h2>${post.title}</h2>
                <div class="post-meta">Por ${post.author} - ${new Date(post.date).toLocaleString()}</div>
                <div class="post-content">${post.content}</div>
                ${currentUser && currentUser.role === 'admin' ? `<button class="delete-post-btn" data-id="${post.id}">Eliminar Post</button>` : ''}
            `;
            
            await loadComments(postId);
            showPostDetailSection();
        } catch (error) {
            console.error('Error al cargar post:', error);
        }
    }
    
    async function deletePost(postId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este post?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showPostsSection();
                loadPosts();
            } else {
                alert('Error al eliminar el post');
            }
        } catch (error) {
            console.error('Error al eliminar post:', error);
            alert('Error al eliminar el post');
        }
    }
    
    async function createPost() {
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const fileInput = document.getElementById('post-file');
        
        try {
            let imageUrl = null;
            
            // Si hay un archivo, subirlo primero
            if (fileInput.files.length > 0) {
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    imageUrl = uploadData.url;
                }
            }
            
            // Crear el post
            const postContent = imageUrl ? `${content}<br><img src="${imageUrl}" class="post-image" alt="Imagen del post">` : content;
            
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content: postContent })
            });
            
            if (response.ok) {
                showMessage(createPostMessage, 'Post creado exitosamente', 'success');
                createPostForm.reset();
                showPostsSection();
                loadPosts();
            } else {
                const data = await response.json();
                showMessage(createPostMessage, data.error, 'error');
            }
        } catch (error) {
            console.error('Error al crear post:', error);
            showMessage(createPostMessage, 'Error al crear post', 'error');
        }
    }
    
    // Funciones de comentarios
    async function loadComments(postId) {
        try {
            const response = await fetch(`/api/posts/${postId}/comments`);
            const comments = await response.json();
            
            commentsContainer.innerHTML = '';
            
            comments.forEach(comment => {
                const commentElement = createCommentElement(comment);
                commentsContainer.appendChild(commentElement);
            });
        } catch (error) {
            console.error('Error al cargar comentarios:', error);
        }
    }
    
    function createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        
        const date = new Date(comment.date).toLocaleString();
        
        commentDiv.innerHTML = `
            <div class="comment-meta">Por ${comment.author} - ${date}</div>
            <div class="comment-content">${comment.content}</div>
        `;
        
        return commentDiv;
    }
    
    async function addComment() {
        const author = document.getElementById('comment-author').value;
        const content = document.getElementById('comment-content').value;
        
        try {
            const response = await fetch(`/api/posts/${currentPostId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ author, content })
            });
            
            if (response.ok) {
                commentForm.reset();
                loadComments(currentPostId);
            } else {
                const data = await response.json();
                alert(data.error);
            }
        } catch (error) {
            console.error('Error al agregar comentario:', error);
            alert('Error al agregar comentario');
        }
    }
});