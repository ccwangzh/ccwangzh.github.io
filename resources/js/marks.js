// DOM元素选择
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const addBookmarkButton = document.getElementById('addBookmark');
const bookmarksContainer = document.getElementById('bookmarksContainer');
const quickLinksGrid = document.getElementById('quickLinksGrid');
const modal = document.getElementById('bookmarkModal');
const closeButton = modal.querySelector('.close');
const bookmarkForm = document.getElementById('bookmarkForm');
const bookmarkCategory = document.getElementById('bookmarkCategory');
const urlGroup = document.querySelector('.url-group');
const contentGroup = document.querySelector('.content-group');

// 初始化数据
let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
const quickLinks = [
    { title: '百度', url: 'https://www.baidu.com', icon: 'fab fa-chrome' },
    { title: '谷歌', url: 'https://www.google.com', icon: 'fab fa-google' },
    { title: 'GitHub', url: 'https://github.com', icon: 'fab fa-github' },
    { title: '微博', url: 'https://weibo.com', icon: 'fab fa-weibo' },
];

// 事件处理函数
function handleBookmarkClick(event, bookmark) {
    if (bookmark.category === 'custom' && bookmark.content) {
        try {
            const fn = new Function(bookmark.content);
            fn.call(window);
        } catch (error) {
            console.error('执行JavaScript代码时出错:', error);
            alert('执行JavaScript代码时出错: ' + error.message);
        }
    } else if (bookmark.url) {
        window.open(bookmark.url, '_blank');
    }
}

// 切换表单显示
function toggleFormFields() {
    const isCustom = bookmarkCategory.value === 'custom';
    urlGroup.style.display = isCustom ? 'none' : 'block';
    contentGroup.style.display = isCustom ? 'block' : 'none';
    
    // 根据类型设置必填字段
    document.getElementById('bookmarkUrl').required = !isCustom;
    document.getElementById('bookmarkContent').required = isCustom;
}

// 渲染书签
function renderBookmarks(bookmarksToRender = bookmarks) {
    bookmarksContainer.innerHTML = '';
    bookmarksToRender.forEach((bookmark, index) => {
        const bookmarkCard = document.createElement('div');
        bookmarkCard.className = 'bookmark-card';
        bookmarkCard.style.borderLeft = `4px solid ${bookmark.color || '#3498db'}`;

        bookmarkCard.innerHTML = `
            <a href="javascript:void(0)" onclick="event.preventDefault()">
                <h3>${bookmark.title}</h3>
                <span class="category">${bookmark.category === 'custom' ? '定制书签' : '普通书签'}</span>
            </a>
            <button class="edit-bookmark" title="编辑"><i class="fas fa-edit"></i></button>
            <button class="delete-bookmark" title="删除"><i class="fas fa-trash"></i></button>
        `;

        // 添加点击事件
        const linkElement = bookmarkCard.querySelector('a');
        linkElement.addEventListener('click', (e) => handleBookmarkClick(e, bookmark));

        // 添加删除事件
        const deleteButton = bookmarkCard.querySelector('.delete-bookmark');
        deleteButton.addEventListener('click', () => {
            bookmarks.splice(index, 1);
            saveAndRenderBookmarks();
        });

        // 添加编辑事件
        const editButton = bookmarkCard.querySelector('.edit-bookmark');
        editButton.addEventListener('click', () => {
            openEditModal(bookmark, index);
        });

        bookmarksContainer.appendChild(bookmarkCard);
    });
}

// 渲染快捷链接
function renderQuickLinks() {
    quickLinksGrid.innerHTML = '';
    quickLinks.forEach(link => {
        const quickLink = document.createElement('a');
        quickLink.href = link.url;
        quickLink.target = '_blank';
        quickLink.className = 'quick-link';
        quickLink.innerHTML = `
            <i class="${link.icon}"></i>
            <p>${link.title}</p>
        `;
        quickLinksGrid.appendChild(quickLink);
    });
}

// 保存并重新渲染书签
function saveAndRenderBookmarks() {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    renderBookmarks();
}

// 打开编辑模态框
function openEditModal(bookmark = null, index = null) {
    const titleInput = document.getElementById('bookmarkTitle');
    const urlInput = document.getElementById('bookmarkUrl');
    const categoryInput = document.getElementById('bookmarkCategory');
    const contentInput = document.getElementById('bookmarkContent');
    const colorInput = document.getElementById('bookmarkColor');

    if (bookmark) {
        titleInput.value = bookmark.title;
        categoryInput.value = bookmark.category || 'normal';
        urlInput.value = bookmark.url || '';
        contentInput.value = bookmark.content || '';
        colorInput.value = bookmark.color || '#3498db';
        bookmarkForm.dataset.editIndex = index;
        toggleFormFields();
    } else {
        titleInput.value = '';
        categoryInput.value = 'normal';
        urlInput.value = '';
        contentInput.value = '';
        colorInput.value = '#3498db';
        delete bookmarkForm.dataset.editIndex;
        toggleFormFields();
    }

    modal.style.display = 'block';
}

// 搜索书签
function searchBookmarks(query) {
    const normalizedQuery = query.toLowerCase();
    return bookmarks.filter(bookmark => {
        return bookmark.title.toLowerCase().includes(normalizedQuery) ||
               (bookmark.category && bookmark.category.toLowerCase().includes(normalizedQuery));
    });
}

// 事件监听器
addBookmarkButton.addEventListener('click', () => openEditModal());

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

bookmarkCategory.addEventListener('change', toggleFormFields);

bookmarkForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const isCustom = document.getElementById('bookmarkCategory').value === 'custom';
    const bookmark = {
        title: document.getElementById('bookmarkTitle').value,
        category: document.getElementById('bookmarkCategory').value,
        color: document.getElementById('bookmarkColor').value
    };

    if (isCustom) {
        bookmark.content = document.getElementById('bookmarkContent').value;
    } else {
        bookmark.url = document.getElementById('bookmarkUrl').value;
    }

    const editIndex = bookmarkForm.dataset.editIndex;
    if (editIndex !== undefined) {
        bookmarks[editIndex] = bookmark;
    } else {
        bookmarks.push(bookmark);
    }

    saveAndRenderBookmarks();
    modal.style.display = 'none';
    bookmarkForm.reset();
    toggleFormFields();
});

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query) {
        const filteredBookmarks = searchBookmarks(query);
        renderBookmarks(filteredBookmarks);
    } else {
        renderBookmarks();
    }
});

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        const filteredBookmarks = searchBookmarks(query);
        renderBookmarks(filteredBookmarks);
    }
});

// 初始化渲染
renderBookmarks();
renderQuickLinks();
toggleFormFields();


