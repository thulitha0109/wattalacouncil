// Load header, footer, and slider on page load
window.addEventListener('DOMContentLoaded', () => {
  loadStaticPart('sections/header.html', 'header', () => {
    loadNav(); // Load nav after header
  });

  loadStaticPart('sections/footer.html', 'footer');

  const lang = localStorage.getItem('language') || 'si';
  loadContent('home.html', lang);
});


// Load static HTML parts
function loadStaticPart(filePath, targetId, callback = null) {
  fetch(filePath)
    .then(response => response.text())
    .then(html => {
      document.getElementById(targetId).innerHTML = html;
      if (callback) callback();
    });
}

// Load .md or .html content
function loadContent(pageName, lang = null) {
  if (!lang) lang = localStorage.getItem('language') || 'si';

  // Default to 'home' if no page name is provided
  if (!pageName) pageName = 'home.html';

  // Determine extension based on convention (e.g., all .md pages)
  let fileName = `${pageName}`; // default markdown
  if (pageName === 'contact' || pageName === 'about') {
    fileName = `${pageName}.md`; // example of HTML file exceptions
  }

  const filePath = `pages/${lang}/${fileName}`;
  fetch(filePath)
    .then(response => {
      if (!response.ok) throw new Error('Page not found');
      const ext = fileName.split('.').pop();
      return response.text().then(data => ({ ext, data }));
    })
    .then(({ ext, data }) => {
      const contentDiv = document.getElementById('content');
      contentDiv.innerHTML = ext === 'md' ? marked.parse(data) : data;
    })
    .catch(error => {
      document.getElementById('content').innerHTML = `<p>Error: ${error.message}</p>`;
    });
}


// Load nav dynamically
// Function to close the mobile navigation slider
function closeMobileNav() {
  document.getElementById('menuItems').classList.remove('show');
}

// Attach closeMobileNav function to each nav-item dynamically
function attachCloseNav() {
  // Get all the nav items
  const navItems = document.getElementsByClassName('nav-item');
  
  // Loop through each nav item and add the onclick event
  for (let i = 0; i < navItems.length; i++) {
    navItems[i].onclick = closeMobileNav; // Set the onclick event to close the nav
  }
}
// Close the nav when clicking outside the mobile menu
document.addEventListener('click', function (event) {
  let menu = document.getElementById('menuItems');
  let toggleButton = document.querySelector('.mobile-menu');
  let mobileNav = document.querySelector('.mobile-nav-container');

  // If the click is outside the mobile menu or the menu toggle button, close the menu
  if (!mobileNav.contains(event.target) && !toggleButton.contains(event.target)) {
    closeMobileNav();
  }
});

// Call this function when the page loads or when the nav items are dynamically created

function loadNav(lang = null) {
  if (!lang) lang = localStorage.getItem('language') || 'si';

  fetch(`static/lang/${lang}.json`)
    .then(response => response.json())
    .then(data => {
      // Update council name
      const councilName = document.getElementById('councilName');
      if (councilName) councilName.textContent = data.name;
      const icon = document.getElementById('icon');
      if (icon) icon.textContent = data.name;

      // Update nav links

      const navContainer1 = document.getElementById('navItem1');
      const navContainer2 = document.getElementById('navItem2');
      
      if (navContainer1) navContainer1.innerHTML = '';
      if (navContainer2) navContainer2.innerHTML = '';

      // Recursive function to create nav items
      function createNavItem(item) {
        let navItem = document.createElement('li');
        navItem.classList.add('nav-item');

        // Check for submenus
        if (item.sub_menu) {
          navItem.classList.add('dropdown');

          let dropdownToggle = document.createElement('a');
          dropdownToggle.classList.add('nav-link', 'dropdown-toggle');
          dropdownToggle.href = '#';
          dropdownToggle.setAttribute('role', 'button');
          dropdownToggle.setAttribute('data-bs-toggle', 'dropdown');
          dropdownToggle.textContent = item.text;
          navItem.appendChild(dropdownToggle);

          let dropdownMenu = document.createElement('ul');
          dropdownMenu.classList.add('dropdown-menu');

          // Recursively create sub-items
          item.sub_menu.forEach(sub => {
            let subNavItem = document.createElement('li');

            // Check for deeper submenus
            if (sub.sub_menu) {
              subNavItem.classList.add('dropdown-submenu'); // You can style this
              
              let subDropdownToggle = document.createElement('a');
              subDropdownToggle.classList.add('dropdown-item', 'dropdown-toggle');
              subDropdownToggle.href = '#';
              subDropdownToggle.textContent = sub.text;
              subNavItem.appendChild(subDropdownToggle);

              let subDropdownMenu = document.createElement('ul');
              subDropdownMenu.classList.add('dropdown-menu');

              sub.sub_menu.forEach(subSub => {
                let subSubItem = document.createElement('li');
                let subSubLink = document.createElement('a');
                subSubLink.classList.add('dropdown-item');
                subSubLink.href = '#';
              // Function to dynamically set the onclick event for a sub-sub nav item
                subSubLink.setAttribute('onclick', `closeMobileNav(); loadContent('${subSub.link}')`);
                subSubLink.textContent = subSub.text;
                subSubItem.appendChild(subSubLink);
                subDropdownMenu.appendChild(subSubItem);
              });

              subNavItem.appendChild(subDropdownMenu);
            } else {
              // Simple dropdown item
              let subLink = document.createElement('a');
              subLink.classList.add('dropdown-item');
              subLink.href = '#';
              subLink.setAttribute('onclick', `closeMobileNav(); loadContent('${sub.link}')`);
              subLink.textContent = sub.text;
              subNavItem.appendChild(subLink);
            }

            dropdownMenu.appendChild(subNavItem);
          });
          
          // Load header, footer, and slider on page load
          window.addEventListener('DOMContentLoaded', () => {
            loadStaticPart('sections/header.html', 'header', () => {
              loadNav(); // Load nav after header
              updateActiveLanguage();
            });

            loadStaticPart('sections/footer.html', 'footer');
          
            const lang = localStorage.getItem('language') || 'si';
            loadContent('home.html', lang);
          });

          navItem.appendChild(dropdownMenu);
        } 
        // Normal link
        else {
          let normalLink = document.createElement('a');
          normalLink.classList.add('nav-link');
          normalLink.href = '#';
          normalLink.setAttribute('onclick', `closeMobileNav(); loadContent('${item.link}')`);
          normalLink.textContent = item.text;
          navItem.appendChild(normalLink);
        }

        return navItem;
      }

      // Build main nav
      if (navContainer1 && navContainer2) {
        data.nav.forEach(item => {
          const navItem1 = createNavItem(item);
          const navItem2 = createNavItem(item);
          
          navContainer1.appendChild(navItem1);
          navContainer2.appendChild(navItem2);
        });
      }

    })
    .catch(err => {
      console.error('Failed to load nav:', err);
    });
}

// Change language
function setLanguage(lang) {
  const links = document.querySelectorAll('.active-lang');
  links.forEach(link => link.classList.remove('active'));

  if (lang === 'en') {
    links[0].classList.add('active');
  } else if (lang === 'si') {
    links[1].classList.add('active');
  } else if (lang === 'ta') {
    links[2].classList.add('active');
  }
  
  localStorage.setItem('language', lang);
  loadNav(lang);
  loadContent('home.html', lang);
}

