// ===== Application State =====
const AppState = {
    tabCounter: 1,
    currentProduct: '',
    pinmapData: {},
    currentResults: [],
    currentPins: [],
    customPins: [],
    pinsBySite: {},
    availableSites: [],
    currentPin1: null,
    pinScale: 20 
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTabs();
    initProductSelector();
    initSearchButtons();
    initPinMapModal();
    loadPinmapFiles();
});

// ===== Navigation =====
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
}

// ===== Tabs Management =====
function initTabs() {
    document.querySelector('.add-tab-btn').addEventListener('click', addNewTab);
    
    // Khởi tạo event listeners cho tab đầu tiên
    setupTabEvents(1);
    switchTab(1); // Đảm bảo tab đầu tiên được active
}

function setupTabEvents(tabId) {
    const tabElement = document.querySelector(`.tab[data-tab="${tabId}"]`);
    const closeBtn = tabElement?.querySelector('.tab-close');
    
    if (tabElement && closeBtn) {
        // Xóa event listeners cũ nếu có
        tabElement.replaceWith(tabElement.cloneNode(true));
        const newTabElement = document.querySelector(`.tab[data-tab="${tabId}"]`);
        const newCloseBtn = newTabElement.querySelector('.tab-close');
        
        // Thêm event listeners mới
        newTabElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) {
                switchTab(tabId);
            }
        });
        
        newCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tabId);
        });
    }
}

function addNewTab() {
    AppState.tabCounter++;
    const tabsHeader = document.getElementById('tabs-header');
    const addBtn = tabsHeader.querySelector('.add-tab-btn');
    
    // Tạo tab mới
    const newTab = document.createElement('div');
    newTab.className = 'tab';
    newTab.dataset.tab = AppState.tabCounter;
    newTab.innerHTML = `
        <span class="tab-name">Part ${AppState.tabCounter}</span>
        <button class="tab-close">×</button>
    `;
    
    tabsHeader.insertBefore(newTab, addBtn);
    
    // Tạo nội dung mới
    const tabsContent = document.querySelector('.tabs-content');
    const newContent = document.createElement('div');
    newContent.className = 'tab-content';
    newContent.id = `tab-content-${AppState.tabCounter}`;
    newContent.innerHTML = `<textarea class="data-input" placeholder="Paste WPF data here..."></textarea>`;
    
    tabsContent.appendChild(newContent);
    
    // Thiết lập events cho tab mới
    setupTabEvents(AppState.tabCounter);
    switchTab(AppState.tabCounter);
}

function switchTab(tabId) {
    console.log('Switching to Part:', tabId);
    
    // Ẩn tất cả tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Hiển thị tab được chọn
    const tabElement = document.querySelector(`.tab[data-tab="${tabId}"]`);
    const contentElement = document.getElementById(`tab-content-${tabId}`);
    
    if (tabElement && contentElement) {
        tabElement.classList.add('active');
        contentElement.classList.add('active');
    } else {
        console.error('Part not found:', tabId);
    }
}

function closeTab(tabId) {
    console.log('Closing Part:', tabId);
    
    const tabElement = document.querySelector(`.tab[data-tab="${tabId}"]`);
    const contentElement = document.getElementById(`tab-content-${tabId}`);
    
    // Kiểm tra xem tab có tồn tại không
    if (!tabElement || !contentElement) {
        console.warn('Part not found for closing:', tabId);
        return;
    }
    
    const tabs = document.querySelectorAll('.tab');
    if (tabs.length <= 1) {
        alert('Cannot close the last part!');
        return;
    }
    
    const wasActive = tabElement.classList.contains('active');
    let switchToTabId = null;
    
    // Tìm tab để chuyển đến
    const allTabs = Array.from(document.querySelectorAll('.tab'));
    for (let i = 0; i < allTabs.length; i++) {
        const currentTabId = parseInt(allTabs[i].dataset.tab);
        if (currentTabId !== tabId) {
            switchToTabId = currentTabId;
            break;
        }
    }
    
    // Xóa tab và nội dung
    tabElement.remove();
    contentElement.remove();
    
    // Chuyển sang tab khác nếu tab đóng đang active
    if (wasActive && switchToTabId) {
        setTimeout(() => {
            switchTab(switchToTabId);
        }, 10);
    }
}

// ===== Product Selector =====
function initProductSelector() {
    // Simulate loading pinmap files - add more products as needed
    const products = ['ADP', 'CNP', 'CFD', 'CFH', 'CML S102', 'CML S62', 'GSR', 'HSW', 'U42', 'LBG', 'MPR', 'MTL', 'SKL', 'U22', 'TGP', 'WHL', 'X74', 'X76'];
    
    const selectors = ['product-select', 'product-select-2'];
    selectors.forEach(id => {
        const select = document.getElementById(id);
        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product;
            option.textContent = product;
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            AppState.currentProduct = e.target.value;
            if (e.target.value) {
                loadPinmapData(e.target.value);
            }
        });
    });
}

async function loadPinmapFiles() {
    const pinmapFiles = {
        'ADP': './assets/pinmap/ADP.pinmap',
        'CNP': './assets/pinmap/CNP.pinmap',
        'CFD': './assets/pinmap/ADP.pinmap',
        'CFH': './assets/pinmap/ADP.pinmap',
        'CML S102': './assets/pinmap/ADP.pinmap',
        'CML S62': './assets/pinmap/S62.pinmap',
        'GSR': './assets/pinmap/ADP.pinmap',
        'HSW': './assets/pinmap/ADP.pinmap',
        'U42': './assets/pinmap/ADP.pinmap',
        'LBG': './assets/pinmap/ADP.pinmap',
        'MPR': './assets/pinmap/ADP.pinmap',
        'MTL': './assets/pinmap/ADP.pinmap',
        'SKL': './assets/pinmap/ADP.pinmap',
        'U22': './assets/pinmap/ADP.pinmap',
        'TGP': './assets/pinmap/ADP.pinmap',
        'WHL': './assets/pinmap/ADP.pinmap',
        'X74': './assets/pinmap/X74.pinmap',
        'X76': './assets/pinmap/ADP.pinmap'
    };

    for (const [product, filePath] of Object.entries(pinmapFiles)) {
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                const content = await response.text();
                AppState.pinmapData[product] = parsePinmapData(content);
                console.log(`Loaded pinmap for ${product}: ${AppState.pinmapData[product].length} pins`);
            } else {
                console.warn(`Failed to load pinmap for ${product}: ${response.status}`);
                // Fallback to empty data
                AppState.pinmapData[product] = [];
            }
        } catch (error) {
            console.error(`Error loading pinmap for ${product}:`, error);
            // Fallback to empty data
            AppState.pinmapData[product] = [];
        }
    }
}

function autoSelectProduct(tiuValue) {
    const productSelect = document.getElementById('product-select');
    
    if (!productSelect || !tiuValue || tiuValue.length < 7) return;
    
    // Extract first 3 letters and 6th-7th characters (index 5-6)
    const first3 = tiuValue.substring(0, 3).toUpperCase();
    const chars67 = tiuValue.substring(5, 7).toUpperCase();
    const productKey = first3 + chars67;
    
    console.log(`TIU: ${tiuValue}, Extracted: ${productKey}`);
    
    // Product mapping table
    const productsData = {
        'ADCV4': 'ADP',
        'CLCV8': 'CNP',
        'CFDV6': 'CFD',
        'CFDV4': 'CFH',
        'CMDV4': 'CML S102',
        'CMDV6': 'CML S62',
        'GSRV8': 'GSR',
        'HWDV8': 'HSW',
        'KUMV6': 'U42',
        'LBGX6': 'LBG',
        'MPRV8': 'MPR',
        'MTCV4': 'MTL',
        'SLDV8': 'SKL',
        'SUMV6': 'U22',
        'TGLA6': 'TGP',
        'WHMV4': 'WHL',
        'L747L': 'X74',
        'L767L': 'X76'
    };
    
    const productName = productsData[productKey];
    
    if (productName) {
        // Find matching product option
        const options = Array.from(productSelect.options);
        const matchingOption = options.find(option => 
            option.value && option.value === productName
        );
        
        if (matchingOption) {
            productSelect.value = matchingOption.value;
            AppState.currentProduct = matchingOption.value;
            loadPinmapData(matchingOption.value);
            
            console.log(`Auto-selected product: ${matchingOption.value} based on TIU key: ${productKey}`);
        } else {
            console.log(`Product name found (${productName}) but not in select options`);
        }
    } else {
        console.log(`No product found for TIU key: ${productKey}`);
    }
}

function parsePinmapData(csvData) {
    const lines = csvData.trim().split('\n');
    const data = [];
    
    lines.forEach(line => {
        const parts = line.split(';');
        if (parts.length >= 8) {
            data.push({
                pinName: parts[0],
                name: parts[1],
                components: parts[2],
                x: parseFloat(parts[3]),
                y: parseFloat(parts[4]),
                site0: parts[5] || '',
                site1: parts[5] || '',
                site2: parts[6] || '',
                site3: parts[6] || '',
                site4: parts[7] || '',
                site5: parts[7] || '',
                site6: parts[8] || '',
                site7: parts[8] || ''
            });
        }
    });
    
    return data;
}

function loadPinmapData(product) {
    // Load pinmap data for selected product
    console.log(`Loading pinmap for ${product}`);
}

// ===== Search Functionality =====
function initSearchButtons() {
    document.getElementById('search-btn').addEventListener('click', searchFaildata);
    document.getElementById('analyze-position-btn').addEventListener('click', analyzePosition);
    document.getElementById('show-pinmap-btn').addEventListener('click', () => {
        const selectedSite = document.getElementById('site-select').value;
        showPinMap('faildata', selectedSite);
    });
}

function searchFaildata() {
    const results = [];
    const curfbinByTab = {};
    const tiuByTab = {};
    const siteByTab = {};
    
    const allTextareas = document.querySelectorAll('.tabs-content .data-input');
    
    // Extract curfbin, TIU, and site from each tab
    allTextareas.forEach((textarea) => {
        const content = textarea.value;
        const lines = content.split('\n');
        const tabId = textarea.closest('.tab-content').id.replace('tab-content-', '');
        
        // Extract curfbin
        let curfbinValue = null;
        let tiuValue = null;
        let siteValue = null;
        
        for (let line of lines) {
            const curfbinMatch = line.match(/_curfbin_(\d+)/i);
            if (curfbinMatch) {
                curfbinValue = curfbinMatch[1];
            }
            
            const tiuMatch = line.match(/_tiuid_(\w+)/i);
            if (tiuMatch) {
                tiuValue = tiuMatch[1];
                
                // Auto-select product based on TIU pattern
                if (tiuValue && tiuValue.length >= 7) {
                    autoSelectProduct(tiuValue);
                }
            }
            
            const siteMatch = line.match(/_socket_(\d+)/i);
            if (siteMatch) {
                siteValue = siteMatch[1];
            }
        }
        
        curfbinByTab[tabId] = curfbinValue;
        tiuByTab[tabId] = tiuValue;
        siteByTab[tabId] = siteValue;
    });
    
    // Rest of the searchFaildata function remains the same...
    // Search for faildata
    allTextareas.forEach((textarea) => {
        const content = textarea.value;
        const lines = content.split('\n');
        const tabId = textarea.closest('.tab-content').id.replace('tab-content-', '');
        
        lines.forEach((line) => {
            const faildataValues = [];
            
            // Search for _faildata_
            if (line.toLowerCase().includes('faildata')) {
                const regex = /\w+_faildata_\{([^}]+)\}/gi;
                let match;
                
                while ((match = regex.exec(line)) !== null) {
                    const values = match[1].split(',').map(v => v.trim());
                    faildataValues.push(...values);
                }
            }
            
            // Search for _composite_ with format X_composite_XXXXXX_XXX
            if (line.toLowerCase().includes('composite')) {
                const compositeRegex = /\w+_composite_(\d+)_\d+/gi;
                let match;
                
                while ((match = compositeRegex.exec(line)) !== null) {
                    const value = match[1].trim();
                    // Only add if not -999
                    if (value !== '-999' && value !== '999') {
                        faildataValues.push(value);
                    }
                }
            }
            
            // Add results if any values found
            if (faildataValues.length > 0) {
                results.push({
                    tab: `Part ${tabId}`,
                    tabId: tabId,
                    faildataValues: faildataValues,
                    curfbin: curfbinByTab[tabId],
                    tiu: tiuByTab[tabId],
                    site: siteByTab[tabId]
                });
            }
        });
    });
    
    displayResults(results);
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results-area');
    const pinListContainer = document.getElementById('pin-list-results');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No Fail Data found</div>';
        pinListContainer.style.display = 'none';
        document.getElementById('site-selector-container').style.display = 'none';
        return;
    }
    
    const valueData = {};
    results.forEach(result => {
        result.faildataValues.forEach(value => {
            if (value) {
                const key = `${value}_${result.curfbin}`;
                if (!valueData[key]) {
                    valueData[key] = {value: value, count: 0, curfbin: result.curfbin, tiu: result.tiu, site: result.site};
                }
                valueData[key].count++;
            }
        });
    });
    
    const sortedValues = Object.values(valueData).sort((a, b) => {
        const aNum = parseInt(a.value);
        const bNum = parseInt(b.value);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        return a.value.localeCompare(b.value);
    });
    
    AppState.currentResults = sortedValues;
    AppState.pinsBySite = {};
    AppState.availableSites = [];
    
    sortedValues.forEach((item) => {
        const pin = getPinFromFaildata(item.value, item.site);
        const site = item.site || '0';
        if (!AppState.pinsBySite[site]) {
            AppState.pinsBySite[site] = [];
            AppState.availableSites.push(site);
        }
        if (pin && pin !== '-') AppState.pinsBySite[site].push(pin);
    });
    
    AppState.availableSites.sort((a, b) => parseInt(a) - parseInt(b));
    AppState.currentPins = [];
    Object.values(AppState.pinsBySite).forEach(pins => AppState.currentPins.push(...pins));
    
    let tableRows = '';
    sortedValues.forEach((item) => {
        const converted = convertFaildata(item.value);
        const pinInfo = getPinInfoFromPinmap(item.value, item.site);
        const displayComponents = convertComponentBySite(pinInfo.components, item.site);
        let countClass = 'count-badge';
        if (item.count > 10) countClass += ' danger';
        else if (item.count > 5) countClass += ' warning';
        
        tableRows += `<tr><td><strong>${escapeHtml(item.tiu || '-')}</strong></td><td><strong>${escapeHtml(item.value)}</strong></td><td><code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${escapeHtml(converted.format)}</code></td><td style="text-align: center;">${escapeHtml(item.site || '-')}</td><td style="text-align: center;"><span class="bin-badge">${escapeHtml(item.curfbin || '-')}</span></td><td style="text-align: center;"><span class="${countClass}">${item.count}</span></td><td>${escapeHtml(pinInfo.pinName)}</td><td>${escapeHtml(pinInfo.channel)}</td><td>${escapeHtml(displayComponents)}</td></tr>`;
    });
    
    resultsContainer.innerHTML = `<h3 style="margin-bottom: 15px; color: var(--primary-color);">Found ${sortedValues.length} Fail Data entries</h3><div class="results-table"><table><thead><tr><th style="width: 10%">TIU</th><th style="width: 10%">Fail Data</th><th style="width: 15%">Hifix</th><th style="width: 8%">Site</th><th style="width: 10%">Bin</th><th style="width: 8%">Count</th><th style="width: 12%">Pin</th><th style="width: 12%">Channel</th><th style="width: 12%">Components</th></tr></thead><tbody>${tableRows}</tbody></table></div>`;
    
    displayPinListBySite();
    
    const siteSelectContainer = document.getElementById('site-selector-container');
    const siteSelect = document.getElementById('site-select');
    siteSelect.innerHTML = '<option value="all">All Sites</option>';
    
    if (AppState.availableSites.length > 1) {
        AppState.availableSites.forEach(site => {
            const option = document.createElement('option');
            option.value = site;
            option.textContent = `Site ${site}`;
            siteSelect.appendChild(option);
        });
    }
    
    siteSelectContainer.style.display = 'flex';
    siteSelectContainer.style.alignItems = 'center';
    siteSelectContainer.style.gap = '10px';
    
    siteSelect.onchange = function() {
        if (this.value === 'all') {
            AppState.currentPins = [];
            Object.values(AppState.pinsBySite).forEach(pins => AppState.currentPins.push(...pins));
        } else {
            AppState.currentPins = AppState.pinsBySite[this.value] || [];
        }
    };
}

function displayPinListBySite() {
    const pinListContainer = document.getElementById('pin-list-results');
    if (Object.keys(AppState.pinsBySite).length === 0) {
        pinListContainer.style.display = 'none';
        return;
    }
    
    let html = '<div style="margin-bottom: 20px;">';
    AppState.availableSites.forEach(site => {
        const pins = AppState.pinsBySite[site];
        if (!pins || pins.length === 0) return;
        
        const validPins = pins.filter(pin => pin && pin !== '-');
        const sortedPins = [...new Set(validPins)].sort((a, b) => {
            const regex = /([A-Z]*)(\d*)/;
            const aMatch = a.match(regex);
            const bMatch = b.match(regex);
            const aLetters = aMatch[1] || '';
            const aNumbers = aMatch[2] ? parseInt(aMatch[2]) : 0;
            const bLetters = bMatch[1] || '';
            const bNumbers = bMatch[2] ? parseInt(bMatch[2]) : 0;
            if (aLetters !== bLetters) return aLetters.localeCompare(bLetters);
            return aNumbers - bNumbers;
        });
        
        if (sortedPins.length === 0) return;
        const pinList = sortedPins.join(', ');
        html += `<div style="margin-bottom: 15px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;">
        <h4 style="margin-bottom: 10px; color: var(--primary-color);">
        <span style="font-weight: bold; color: #E4080A;">Site ${escapeHtml(site)}</span> - Total <span style="font-weight: bold; color: #E4080A;">${sortedPins.length}</span> fail pins:
        </h4>
        <div class="pin-list-container">
        <div class="pin-list-content" style="padding: 10px; background: white; border-radius: 4px; border: 1px solid #e0e0e0;">
        ${escapeHtml(pinList)}
        </div>
        <button class="btn copy-btn" onclick="copyPinListForSite('${site}')" style="margin-top: 10px;">
        <span class="btn-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
        <path fill="currentColor" d="M 1024,512 C 1022.976,416.768 1000.448,330.752 954.368,253.952 908.288,176.128 846.848,114.688 770.048,69.632 693.248,23.552 607.232,1.024 512,0 416.768,1.024 330.752,23.552 253.952,69.632 176.128,115.712 114.688,177.152 69.632,253.952 23.552,330.752 1.024,416.768 0,512 c 1.024,95.232 23.552,181.248 69.632,258.048 46.08,77.824 107.52,139.264 184.32,184.32 76.8,46.08 162.816,68.608 258.048,69.632 95.232,-1.024 181.248,-23.552 258.048,-69.632 77.824,-46.08 139.264,-107.52 184.32,-184.32 46.08,-76.8 68.608,-162.816 69.632,-258.048 z M 408.576,267.264 c 7.168,-23.552 21.504,-41.984 41.984,-57.344 20.48,-14.336 43.008,-21.504 69.632,-22.528 26.624,1.024 49.152,8.192 69.632,22.528 19.456,14.336 33.792,32.768 43.008,57.344 h 46.08 c 22.528,0 40.96,8.192 56.32,23.552 14.336,14.336 22.528,32.768 23.552,55.296 v 397.312 c -1.024,22.528 -9.216,40.96 -23.552,56.32 -15.36,15.36 -33.792,23.552 -56.32,23.552 h -317.44 c -22.528,0 -41.984,-8.192 -56.32,-23.552 -15.36,-15.36 -22.528,-33.792 -23.552,-56.32 V 346.112 c 1.024,-22.528 8.192,-40.96 23.552,-55.296 14.336,-15.36 33.792,-23.552 56.32,-23.552 z m -7.168,287.744 c 18.432,-2.048 27.648,-11.264 28.672,-29.696 -1.024,-18.432 -11.264,-28.672 -28.672,-29.696 -18.432,1.024 -28.672,11.264 -29.696,29.696 1.024,17.408 11.264,27.648 29.696,29.696 z m 78.848,-29.696 c 1.024,12.288 7.168,19.456 20.48,20.48 h 158.72 c 12.288,-1.024 18.432,-8.192 19.456,-20.48 -1.024,-12.288 -7.168,-19.456 -19.456,-19.456 h -158.72 c -13.312,0 -19.456,7.168 -20.48,19.456 z m -78.848,149.504 c 18.432,-2.048 27.648,-12.288 28.672,-29.696 -1.024,-18.432 -11.264,-28.672 -28.672,-30.72 -18.432,2.048 -28.672,12.288 -29.696,30.72 1.024,17.408 11.264,27.648 29.696,29.696 z m 78.848,-29.696 c 1.024,12.288 7.168,18.432 20.48,19.456 h 158.72 c 12.288,-1.024 18.432,-7.168 19.456,-19.456 -1.024,-13.312 -7.168,-20.48 -19.456,-20.48 h -158.72 c -13.312,0 -19.456,7.168 -20.48,20.48 z m 79.872,-338.944 c 0,-11.264 -4.096,-21.504 -11.264,-27.648 -8.192,-8.192 -17.408,-11.264 -28.672,-11.264 -11.264,0 -21.504,3.072 -28.672,11.264 -8.192,7.168 -11.264,16.384 -11.264,27.648 0,11.264 3.072,21.504 11.264,28.672 7.168,8.192 17.408,11.264 28.672,11.264 11.264,0 20.48,-3.072 28.672,-11.264 7.168,-8.192 11.264,-17.408 11.264,-28.672 z"/>
        </svg>
        </span>
        Copy Site ${escapeHtml(site)} Pin List
        </button>
        </div>
        </div>
        `;
    });
    html += '</div>';
    pinListContainer.innerHTML = html;
    pinListContainer.style.display = 'block';
}

function copyPinListForSite(site) {
    const pins = AppState.pinsBySite[site];
    if (!pins || pins.length === 0) {alert('No pins to copy for this site!');return}
    const validPins = pins.filter(pin => pin && pin !== '-');
    const sortedPins = [...new Set(validPins)].sort((a, b) => {
        const regex = /([A-Z]*)(\d*)/;
        const aMatch = a.match(regex);
        const bMatch = b.match(regex);
        const aLetters = aMatch[1] || '';
        const aNumbers = aMatch[2] ? parseInt(aMatch[2]) : 0;
        const bLetters = bMatch[1] || '';
        const bNumbers = bMatch[2] ? parseInt(bMatch[2]) : 0;
        if (aLetters !== bLetters) return aLetters.localeCompare(bLetters);
        return aNumbers - bNumbers;
    });
    const pinList = sortedPins.join(', ');
    navigator.clipboard.writeText(pinList).then(() => {
        const buttons = document.querySelectorAll('.copy-btn');
        let targetBtn = null;
        buttons.forEach(btn => {if (btn.textContent.includes(`Site ${site}`)) targetBtn = btn});
        if (targetBtn) {
            const originalHTML = targetBtn.innerHTML;
            targetBtn.innerHTML = `<span class="btn-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M 1024,512 C 1022.976,416.768 1000.448,330.752 954.368,253.952 908.288,176.128 846.848,114.688 770.048,69.632 693.248,23.552 607.232,1.024 512,0 416.768,1.024 330.752,23.552 253.952,69.632 176.128,115.712 114.688,177.152 69.632,253.952 23.552,330.752 1.024,416.768 0,512 c 1.024,95.232 23.552,181.248 69.632,258.048 46.08,77.824 107.52,139.264 184.32,184.32 76.8,46.08 162.816,68.608 258.048,69.632 95.232,-1.024 181.248,-23.552 258.048,-69.632 77.824,-46.08 139.264,-107.52 184.32,-184.32 46.08,-76.8 68.608,-162.816 69.632,-258.048 z M 521.216,187.392 c 25.6,1.024 49.152,8.192 69.632,22.528 19.456,14.336 34.816,33.792 43.008,57.344 h 46.08 c 22.528,1.024 40.96,8.192 56.32,23.552 14.336,14.336 22.528,32.768 23.552,55.296 v 397.312 c -1.024,22.528 -9.216,40.96 -23.552,56.32 -15.36,15.36 -33.792,23.552 -56.32,23.552 h -317.44 c -22.528,0 -41.984,-8.192 -56.32,-23.552 -15.36,-15.36 -22.528,-33.792 -23.552,-56.32 V 346.112 c 1.024,-22.528 8.192,-40.96 23.552,-55.296 14.336,-15.36 33.792,-22.528 56.32,-23.552 H 409.6 c 7.168,-23.552 21.504,-41.984 41.984,-57.344 20.48,-14.336 43.008,-21.504 69.632,-22.528 z M 665.6,530.432 c 6.144,-7.168 9.216,-15.36 9.216,-24.576 v -2.048 c 0,-8.192 -3.072,-16.384 -9.216,-23.552 -8.192,-7.168 -16.384,-10.24 -25.6,-10.24 -9.216,0 -17.408,3.072 -24.576,10.24 L 481.28,614.4 c -21.504,-21.504 -35.84,-35.84 -44.032,-43.008 -7.168,-7.168 -10.24,-10.24 -10.24,-11.264 -7.168,-7.168 -15.36,-10.24 -24.576,-10.24 -10.24,0 -18.432,3.072 -25.6,10.24 -6.144,7.168 -9.216,15.36 -9.216,24.576 v 2.048 c 0,8.192 3.072,15.36 9.216,22.528 l 79.872,79.872 c 7.168,7.168 15.36,10.24 24.576,10.24 9.216,0 18.432,-3.072 25.6,-10.24 z M 521.216,346.112 c 11.264,0 20.48,-3.072 28.672,-11.264 7.168,-7.168 11.264,-17.408 11.264,-28.672 0,-11.264 -4.096,-20.48 -11.264,-27.648 -8.192,-8.192 -17.408,-11.264 -28.672,-11.264 -11.264,0 -21.504,3.072 -28.672,11.264 -8.192,7.168 -11.264,16.384 -11.264,27.648 0,11.264 3.072,20.48 11.264,28.672 7.168,8.192 17.408,11.264 28.672,11.264 z"/></svg></span>Copied!`;
            targetBtn.classList.add('copied');
            setTimeout(() => {targetBtn.innerHTML = originalHTML;targetBtn.classList.remove('copied')}, 2000);
        }
    }).catch(err => {console.error('Copy error: ', err);alert('Failed to copy!')})
}

function convertComponentBySite(components, site) {
    if (!components || components === '-') {
        return '-';
    }
    
    const siteNum = parseInt(site);
    
    // Site 0 or 1: keep original
    if (siteNum === 0 || siteNum === 1) {
        return components;
    }
    
    // Determine the replacement letter
    let replacementLetter;
    if (siteNum === 2 || siteNum === 3) {
        replacementLetter = 'C';
    } else if (siteNum === 4 || siteNum === 5) {
        replacementLetter = 'E';
    } else if (siteNum === 6 || siteNum === 7) {
        replacementLetter = 'G';
    } else {
        return components; // Unknown site, keep original
    }
    
    // Split components by comma and process each
    return components.split(',').map(comp => {
        comp = comp.trim();
        // Replace the last 'A' with the replacement letter
        // Use regex to find the last occurrence of 'A'
        return comp.replace(/A(?=[^A]*$)/, replacementLetter);
    }).join(', ');
}

function displayPinList(pins) {
    const pinListContainer = document.getElementById('pin-list-results');
    const pinListContent = document.querySelector('.pin-list-content');
    const pinCountElement = document.getElementById('pin-count');
    
    if (pins.length === 0) {
        pinListContainer.style.display = 'none';
        return;
    }
    
    // Lọc ra các pin hợp lệ (loại bỏ giá trị '-')
    const validPins = pins.filter(pin => pin && pin !== '-');
    
    if (validPins.length === 0) {
        pinListContainer.style.display = 'none';
        return;
    }
    
    // Sắp xếp pin theo thứ tự
    const sortedPins = [...new Set(validPins)].sort((a, b) => {
        // Tách phần chữ và số để sắp xếp đúng
        const regex = /([A-Z]*)(\d*)/;
        const aMatch = a.match(regex);
        const bMatch = b.match(regex);
        
        const aLetters = aMatch[1] || '';
        const aNumbers = aMatch[2] ? parseInt(aMatch[2]) : 0;
        const bLetters = bMatch[1] || '';
        const bNumbers = bMatch[2] ? parseInt(bMatch[2]) : 0;
        
        // So sánh phần chữ trước
        if (aLetters !== bLetters) {
            return aLetters.localeCompare(bLetters);
        }
        // Sau đó so sánh phần số
        return aNumbers - bNumbers;
    });
    
    const pinList = sortedPins.join(', ');
    
    // Cập nhật số lượng pin
    pinCountElement.textContent = sortedPins.length;
    pinListContent.textContent = pinList;
    pinListContainer.style.display = 'block';
    
    // Cập nhật currentPins với các pin đã được sắp xếp và lọc
    AppState.currentPins = sortedPins;
}

function convertFaildata(value) {
    const numStr = value.toString().replace(/\D/g, '');
    
    if (numStr.length < 6) {
        return { format: value};
    }
    
    const last6 = numStr.slice(-6);
    const first3 = last6.slice(0, 3);
    const last3 = last6.slice(3, 6);
    
    return {
        format: `J1${first3}.${last3}`
    };
}

function getPinInfoFromPinmap(faildata, site) {
    if (!AppState.currentProduct || !AppState.pinmapData[AppState.currentProduct]) {
        return { pinName: '-', channel: '-' };
    }
    
    const last6 = faildata.toString().replace(/\D/g, '').slice(-6);
    const pinmapData = AppState.pinmapData[AppState.currentProduct];
    
    const siteField = `site${site || '0'}`;
    const pin = pinmapData.find(p => p[siteField] === last6);
    
    if (pin) {
        return { pinName: pin.pinName, channel: pin.name, components: pin.components };
    }
    
    return { pinName: '-', channel: '-', components: '-' };
}

function getPinFromFaildata(faildata, site) {
    const pinInfo = getPinInfoFromPinmap(faildata, site);
    return pinInfo.pinName;
}

// ===== Position Analysis =====
function analyzePosition() {
    const textarea = document.getElementById('position-analysis-textarea');
    const content = textarea.value.trim();
    
    if (!content) {
        document.getElementById('position-results').innerHTML = '<div class="no-results">Please enter data</div>';
        return;
    }

    const lines = content.split('\n');
    const positionSet = new Set();
    
    lines.forEach(line => {
        const parts = line.split('\t');
        if (parts.length >= 4) {
            const positionColumn = parts[3].trim();
            if (positionColumn && positionColumn !== 'Position') {
                const positions = positionColumn.split(';');
                positions.forEach(pos => {
                    const trimmedPos = pos.trim();
                    if (trimmedPos) {
                        positionSet.add(trimmedPos);
                    }
                });
            }
        }
    });

    const sortedPositions = Array.from(positionSet).sort();
    AppState.currentPins = sortedPositions;
    
    displayPositionResults(sortedPositions);
}

function displayPositionResults(positions) {
    const resultsContainer = document.getElementById('position-results');
    
    if (positions.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No pins found</div>';
        document.getElementById('show-pinmap-position-btn').style.display = 'none';
        return;
    }

    const positionList = positions.join(', ');

    const html = `
        <h3 style="margin-bottom: 15px; color: var(--primary-color);">
            Total ${positions.length} pins:
        </h3>
        <div class="position-list">
            ${escapeHtml(positionList)}
        </div>
        <button class="btn copy-btn" onclick="copyPositionList()">
            <span class="btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                    <path fill="currentColor"
                        d="M 1024,512 C 1022.976,416.768 1000.448,330.752 954.368,253.952 908.288,176.128 846.848,114.688 770.048,69.632 693.248,23.552 607.232,1.024 512,0 416.768,1.024 330.752,23.552 253.952,69.632 176.128,115.712 114.688,177.152 69.632,253.952 23.552,330.752 1.024,416.768 0,512 c 1.024,95.232 23.552,181.248 69.632,258.048 46.08,77.824 107.52,139.264 184.32,184.32 76.8,46.08 162.816,68.608 258.048,69.632 95.232,-1.024 181.248,-23.552 258.048,-69.632 77.824,-46.08 139.264,-107.52 184.32,-184.32 46.08,-76.8 68.608,-162.816 69.632,-258.048 z M 408.576,267.264 c 7.168,-23.552 21.504,-41.984 41.984,-57.344 20.48,-14.336 43.008,-21.504 69.632,-22.528 26.624,1.024 49.152,8.192 69.632,22.528 19.456,14.336 33.792,32.768 43.008,57.344 h 46.08 c 22.528,0 40.96,8.192 56.32,23.552 14.336,14.336 22.528,32.768 23.552,55.296 v 397.312 c -1.024,22.528 -9.216,40.96 -23.552,56.32 -15.36,15.36 -33.792,23.552 -56.32,23.552 h -317.44 c -22.528,0 -41.984,-8.192 -56.32,-23.552 -15.36,-15.36 -22.528,-33.792 -23.552,-56.32 V 346.112 c 1.024,-22.528 8.192,-40.96 23.552,-55.296 14.336,-15.36 33.792,-23.552 56.32,-23.552 z m -7.168,287.744 c 18.432,-2.048 27.648,-11.264 28.672,-29.696 -1.024,-18.432 -11.264,-28.672 -28.672,-29.696 -18.432,1.024 -28.672,11.264 -29.696,29.696 1.024,17.408 11.264,27.648 29.696,29.696 z m 78.848,-29.696 c 1.024,12.288 7.168,19.456 20.48,20.48 h 158.72 c 12.288,-1.024 18.432,-8.192 19.456,-20.48 -1.024,-12.288 -7.168,-19.456 -19.456,-19.456 h -158.72 c -13.312,0 -19.456,7.168 -20.48,19.456 z m -78.848,149.504 c 18.432,-2.048 27.648,-12.288 28.672,-29.696 -1.024,-18.432 -11.264,-28.672 -28.672,-30.72 -18.432,2.048 -28.672,12.288 -29.696,30.72 1.024,17.408 11.264,27.648 29.696,29.696 z m 78.848,-29.696 c 1.024,12.288 7.168,18.432 20.48,19.456 h 158.72 c 12.288,-1.024 18.432,-7.168 19.456,-19.456 -1.024,-13.312 -7.168,-20.48 -19.456,-20.48 h -158.72 c -13.312,0 -19.456,7.168 -20.48,20.48 z m 79.872,-338.944 c 0,-11.264 -4.096,-21.504 -11.264,-27.648 -8.192,-8.192 -17.408,-11.264 -28.672,-11.264 -11.264,0 -21.504,3.072 -28.672,11.264 -8.192,7.168 -11.264,16.384 -11.264,27.648 0,11.264 3.072,21.504 11.264,28.672 7.168,8.192 17.408,11.264 28.672,11.264 11.264,0 20.48,-3.072 28.672,-11.264 7.168,-8.192 11.264,-17.408 11.264,-28.672 z"/>
                </svg>
            </span>
            Copy Pin List
        </button>
    `;
    
    resultsContainer.innerHTML = html;
    document.getElementById('show-pinmap-position-btn').style.display = 'inline-flex';
}

function copyPositionList() {
    const positionList = document.querySelector('.position-list').textContent;
    
    navigator.clipboard.writeText(positionList).then(() => {
        const copyBtn = document.querySelector('#position-results .copy-btn');
        const originalHTML = copyBtn.innerHTML;
        
        copyBtn.innerHTML = `
            <span class="btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                    <path fill="currentColor"
                        d="M 1024,512 C 1022.976,416.768 1000.448,330.752 954.368,253.952 908.288,176.128 846.848,114.688 770.048,69.632 693.248,23.552 607.232,1.024 512,0 416.768,1.024 330.752,23.552 253.952,69.632 176.128,115.712 114.688,177.152 69.632,253.952 23.552,330.752 1.024,416.768 0,512 c 1.024,95.232 23.552,181.248 69.632,258.048 46.08,77.824 107.52,139.264 184.32,184.32 76.8,46.08 162.816,68.608 258.048,69.632 95.232,-1.024 181.248,-23.552 258.048,-69.632 77.824,-46.08 139.264,-107.52 184.32,-184.32 46.08,-76.8 68.608,-162.816 69.632,-258.048 z M 521.216,187.392 c 25.6,1.024 49.152,8.192 69.632,22.528 19.456,14.336 34.816,33.792 43.008,57.344 h 46.08 c 22.528,1.024 40.96,8.192 56.32,23.552 14.336,14.336 22.528,32.768 23.552,55.296 v 397.312 c -1.024,22.528 -9.216,40.96 -23.552,56.32 -15.36,15.36 -33.792,23.552 -56.32,23.552 h -317.44 c -22.528,0 -41.984,-8.192 -56.32,-23.552 -15.36,-15.36 -22.528,-33.792 -23.552,-56.32 V 346.112 c 1.024,-22.528 8.192,-40.96 23.552,-55.296 14.336,-15.36 33.792,-22.528 56.32,-23.552 H 409.6 c 7.168,-23.552 21.504,-41.984 41.984,-57.344 20.48,-14.336 43.008,-21.504 69.632,-22.528 z M 665.6,530.432 c 6.144,-7.168 9.216,-15.36 9.216,-24.576 v -2.048 c 0,-8.192 -3.072,-16.384 -9.216,-23.552 -8.192,-7.168 -16.384,-10.24 -25.6,-10.24 -9.216,0 -17.408,3.072 -24.576,10.24 L 481.28,614.4 c -21.504,-21.504 -35.84,-35.84 -44.032,-43.008 -7.168,-7.168 -10.24,-10.24 -10.24,-11.264 -7.168,-7.168 -15.36,-10.24 -24.576,-10.24 -10.24,0 -18.432,3.072 -25.6,10.24 -6.144,7.168 -9.216,15.36 -9.216,24.576 v 2.048 c 0,8.192 3.072,15.36 9.216,22.528 l 79.872,79.872 c 7.168,7.168 15.36,10.24 24.576,10.24 9.216,0 18.432,-3.072 25.6,-10.24 z M 521.216,346.112 c 11.264,0 20.48,-3.072 28.672,-11.264 7.168,-7.168 11.264,-17.408 11.264,-28.672 0,-11.264 -4.096,-20.48 -11.264,-27.648 -8.192,-8.192 -17.408,-11.264 -28.672,-11.264 -11.264,0 -21.504,3.072 -28.672,11.264 -8.192,7.168 -11.264,16.384 -11.264,27.648 0,11.264 3.072,20.48 11.264,28.672 7.168,8.192 17.408,11.264 28.672,11.264 z"/>
                </svg>
            </span>
            Copied!
        `;
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Copy error: ', err);
        alert('Failed to copy!');
    });
}

function copyPinList() {
    const pinListContent = document.querySelector('.pin-list-content');
    const pinList = pinListContent.textContent;
    
    if (!pinList.trim()) {
        alert('No pins to copy!');
        return;
    }
    
    navigator.clipboard.writeText(pinList).then(() => {
        const copyBtn = document.querySelector('#pin-list-results .copy-btn');
        const originalHTML = copyBtn.innerHTML;
        
        copyBtn.innerHTML = `
            <span class="btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                    <path fill="currentColor"
                        d="M 1024,512 C 1022.976,416.768 1000.448,330.752 954.368,253.952 908.288,176.128 846.848,114.688 770.048,69.632 693.248,23.552 607.232,1.024 512,0 416.768,1.024 330.752,23.552 253.952,69.632 176.128,115.712 114.688,177.152 69.632,253.952 23.552,330.752 1.024,416.768 0,512 c 1.024,95.232 23.552,181.248 69.632,258.048 46.08,77.824 107.52,139.264 184.32,184.32 76.8,46.08 162.816,68.608 258.048,69.632 95.232,-1.024 181.248,-23.552 258.048,-69.632 77.824,-46.08 139.264,-107.52 184.32,-184.32 46.08,-76.8 68.608,-162.816 69.632,-258.048 z M 521.216,187.392 c 25.6,1.024 49.152,8.192 69.632,22.528 19.456,14.336 34.816,33.792 43.008,57.344 h 46.08 c 22.528,1.024 40.96,8.192 56.32,23.552 14.336,14.336 22.528,32.768 23.552,55.296 v 397.312 c -1.024,22.528 -9.216,40.96 -23.552,56.32 -15.36,15.36 -33.792,23.552 -56.32,23.552 h -317.44 c -22.528,0 -41.984,-8.192 -56.32,-23.552 -15.36,-15.36 -22.528,-33.792 -23.552,-56.32 V 346.112 c 1.024,-22.528 8.192,-40.96 23.552,-55.296 14.336,-15.36 33.792,-22.528 56.32,-23.552 H 409.6 c 7.168,-23.552 21.504,-41.984 41.984,-57.344 20.48,-14.336 43.008,-21.504 69.632,-22.528 z M 665.6,530.432 c 6.144,-7.168 9.216,-15.36 9.216,-24.576 v -2.048 c 0,-8.192 -3.072,-16.384 -9.216,-23.552 -8.192,-7.168 -16.384,-10.24 -25.6,-10.24 -9.216,0 -17.408,3.072 -24.576,10.24 L 481.28,614.4 c -21.504,-21.504 -35.84,-35.84 -44.032,-43.008 -7.168,-7.168 -10.24,-10.24 -10.24,-11.264 -7.168,-7.168 -15.36,-10.24 -24.576,-10.24 -10.24,0 -18.432,3.072 -25.6,10.24 -6.144,7.168 -9.216,15.36 -9.216,24.576 v 2.048 c 0,8.192 3.072,15.36 9.216,22.528 l 79.872,79.872 c 7.168,7.168 15.36,10.24 24.576,10.24 9.216,0 18.432,-3.072 25.6,-10.24 z M 521.216,346.112 c 11.264,0 20.48,-3.072 28.672,-11.264 7.168,-7.168 11.264,-17.408 11.264,-28.672 0,-11.264 -4.096,-20.48 -11.264,-27.648 -8.192,-8.192 -17.408,-11.264 -28.672,-11.264 -11.264,0 -21.504,3.072 -28.672,11.264 -8.192,7.168 -11.264,16.384 -11.264,27.648 0,11.264 3.072,20.48 11.264,28.672 7.168,8.192 17.408,11.264 28.672,11.264 z"/>
                </svg>
            </span>
            Copied!
        `;
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Copy error: ', err);
        alert('Failed to copy pin list!');
    });
}

// ===== Pin Map Modal =====
function initPinMapModal() {
    document.getElementById('show-pinmap-position-btn').addEventListener('click', () => showPinMap('position', 'all'));
    document.getElementById('close-modal').addEventListener('click', closePinMapModal);
    document.getElementById('add-custom-pins').addEventListener('click', addCustomPins);
    document.getElementById('save-pinmap').addEventListener('click', savePinMapImage);
    document.getElementById('save-pinmap-data').addEventListener('click', savePinMapData);
    document.getElementById('clear-fill').addEventListener('click', clearPinFill);
    document.getElementById('flip-horizontal').addEventListener('click', flipHorizontal);
    document.getElementById('flip-vertical').addEventListener('click', flipVertical);
    document.getElementById('rotate-left').addEventListener('click', rotateLeft);
    document.getElementById('rotate-right').addEventListener('click', rotateRight);
    document.getElementById('zoom-in').addEventListener('click', increasePinSpacing);
    document.getElementById('zoom-out').addEventListener('click', decreasePinSpacing);
    document.getElementById('pinmap-modal').addEventListener('click', (e) => {
        if (e.target.id === 'pinmap-modal') closePinMapModal();
    });
}

function showPinMap(source, selectedSite = 'all') {
    if (!AppState.currentProduct) {
        alert('Please select a product first!');
        return;
    }
    if (source === 'faildata') {
        if (selectedSite === 'all') {
            AppState.currentPins = [];
            Object.values(AppState.pinsBySite).forEach(pins => AppState.currentPins.push(...pins));
        } else {
            AppState.currentPins = AppState.pinsBySite[selectedSite] || [];
        }
    }
    const modal = document.getElementById('pinmap-modal');
    modal.classList.add('active');
    drawPinMap();
}

function closePinMapModal() {
    document.getElementById('pinmap-modal').classList.remove('active');
}

function addCustomPins() {
    const input = document.getElementById('custom-pins');
    const customPinsStr = input.value;
    
    if (!customPinsStr.trim()) return;
    
    const pins = customPinsStr.split(/[,;\s]+/).map(p => p.trim()).filter(p => p);
    AppState.customPins = [...new Set([...AppState.customPins, ...pins])];
    
    input.value = '';
    drawPinMap();
}

function drawPinMap() {
    const canvas = document.getElementById('pinmap-canvas');
    const ctx = canvas.getContext('2d');
    
    if (!AppState.pinmapData[AppState.currentProduct]) {
        ctx.fillText('No pinmap data available', 50, 50);
        return;
    }
    
    const pinmapData = AppState.pinmapData[AppState.currentProduct];
    const highlightPins = [...new Set([...AppState.currentPins, ...AppState.customPins])];
    
    // Calculate canvas size
    const maxX = Math.max(...pinmapData.map(p => p.x));
    const maxY = Math.max(...pinmapData.map(p => p.y));
    const minX = Math.min(...pinmapData.map(p => p.x));
    const minY = Math.min(...pinmapData.map(p => p.y));
    
    const scale = AppState.pinScale;
    const padding = 50;
    
    canvas.width = (maxX - minX + 2) * scale + padding * 2;
    canvas.height = (maxY - minY + 2) * scale + padding * 2;
    
    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    ctx.strokeStyle = '#E4080A';
    ctx.lineWidth = 5;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    
    // Find or use current pin 1
    if (!AppState.currentPin1) {
        AppState.currentPin1 = findPin1(pinmapData);
    }
    const pin1 = AppState.currentPin1;
    
    console.log(`Pin 1: ${pin1.pinName} at (${pin1.x}, ${pin1.y})`);
    
    // Xác định góc border dựa trên vị trí tương đối của pin 1
    const tolerance = 2; // Tăng tolerance vì pin có thể không chính xác ở góc
    
    // Tính khoảng cách đến các cạnh
    const distToLeft = pin1.x - minX;
    const distToRight = maxX - pin1.x;
    const distToBottom = pin1.y - minY;
    const distToTop = maxY - pin1.y;
    
    // Tìm cạnh gần nhất
    const minDistX = Math.min(distToLeft, distToRight);
    const minDistY = Math.min(distToBottom, distToTop);
    
    console.log(`Distances - Left:${distToLeft}, Right:${distToRight}, Bottom:${distToBottom}, Top:${distToTop}`);
    
    // Vẽ tam giác đỏ ở góc gần nhất với pin 1
    ctx.fillStyle = '#E4080A';
    ctx.beginPath();
    
    if (minDistX === distToLeft && minDistY === distToBottom) {
        // Góc dưới trái
        console.log("Drawing triangle at Bottom-Left corner");
        ctx.moveTo(5, canvas.height - 5);
        ctx.lineTo(5, canvas.height - 50);
        ctx.lineTo(50, canvas.height - 5);
    } else if (minDistX === distToLeft && minDistY === distToTop) {
        // Góc trên trái
        console.log("Drawing triangle at Top-Left corner");
        ctx.moveTo(5, 5);
        ctx.lineTo(5, 50);
        ctx.lineTo(50, 5);
    } else if (minDistX === distToRight && minDistY === distToTop) {
        // Góc trên phải
        console.log("Drawing triangle at Top-Right corner");
        ctx.moveTo(canvas.width - 5, 5);
        ctx.lineTo(canvas.width - 5, 50);
        ctx.lineTo(canvas.width - 50, 5);
    } else if (minDistX === distToRight && minDistY === distToBottom) {
        // Góc dưới phải
        console.log("Drawing triangle at Bottom-Right corner");
        ctx.moveTo(canvas.width - 5, canvas.height - 5);
        ctx.lineTo(canvas.width - 5, canvas.height - 50);
        ctx.lineTo(canvas.width - 50, canvas.height - 5);
    } else {
        // Fallback: góc dưới trái
        console.log("Drawing triangle at default Bottom-Left corner");
        ctx.moveTo(5, canvas.height - 5);
        ctx.lineTo(5, canvas.height - 50);
        ctx.lineTo(50, canvas.height - 5);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Draw all pins
    pinmapData.forEach(pin => {
        const x = (pin.x - minX) * scale + padding;
        const y = canvas.height - ((pin.y - minY) * scale + padding);
        const radius = 30;
        
        const isHighlighted = highlightPins.includes(pin.pinName);
        
        // Draw pin circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = isHighlighted ? '#E4080A' : 'white';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw pin name
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pin.pinName, x, y);
    });
    
    const wrapper = canvas.parentElement;
    wrapper.scrollLeft = 0;
    wrapper.scrollTop = 0;
    
    enableCanvasDragging(canvas);
    
    // Update pin count
    const totalPins = pinmapData.length;
    const highlightedCount = highlightPins.filter(p => 
        pinmapData.some(pin => pin.pinName === p)
    ).length;
    
    document.getElementById('pin-count-display').textContent = 
        `Total pins: ${highlightedCount}/${totalPins}`;
}

function findPin1(pinmapData) {
    // Tách pin name thành phần chữ và số
    const parsePinName = (pinName) => {
        const match = pinName.match(/^([A-Z]*)(\d+)$/);
        if (match) {
            return {
                letters: match[1],
                number: parseInt(match[2])
            };
        }
        return { letters: pinName, number: 0 };
    };

    return pinmapData.reduce((min, p) => {
        const current = parsePinName(p.pinName);
        const minParsed = parsePinName(min.pinName);
        
        // So sánh phần chữ trước
        if (current.letters < minParsed.letters) return p;
        if (current.letters > minParsed.letters) return min;
        
        // Nếu phần chữ bằng nhau, so sánh phần số
        return current.number < minParsed.number ? p : min;
    }, pinmapData[0]);
}

function enableCanvasDragging(canvas) {
    const wrapper = canvas.parentElement;
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    let currentScale = 1;
    
    // Initialize transform origin
    canvas.style.transformOrigin = 'top left';
    
    // Calculate max scroll values based on canvas size and scale
    const updateScrollLimits = () => {
        const canvasRect = canvas.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        
        // Calculate actual canvas dimensions including scale
        const scaledCanvasWidth = canvasRect.width;
        const scaledCanvasHeight = canvasRect.height;
        
        // Calculate max scroll values - cho phép scroll thêm một chút để border không bị cắt
        const extraPadding = 5; // Thêm padding để đảm bảo border không bị cắt
        const maxScrollX = Math.max(0, scaledCanvasWidth - wrapperRect.width + extraPadding);
        const maxScrollY = Math.max(0, scaledCanvasHeight - wrapperRect.height + extraPadding);
        
        return { maxScrollX, maxScrollY, scaledCanvasWidth, scaledCanvasHeight };
    };
    
    // Hàm constraint scroll position
    const constrainScroll = (scrollX, scrollY) => {
        const { maxScrollX, maxScrollY, scaledCanvasWidth, scaledCanvasHeight } = updateScrollLimits();
        const wrapperRect = wrapper.getBoundingClientRect();
        
        // Nếu canvas nhỏ hơn wrapper, cho phép scroll một chút để căn giữa
        if (scaledCanvasWidth <= wrapperRect.width) {
            // Cho phép scroll trong khoảng từ -extraPadding đến 0 để căn giữa
            const extraPadding = 10;
            scrollX = Math.max(-extraPadding, Math.min(0, scrollX));
        } else {
            scrollX = Math.max(0, Math.min(maxScrollX, scrollX));
        }
        
        if (scaledCanvasHeight <= wrapperRect.height) {
            // Cho phép scroll trong khoảng từ -extraPadding đến 0 để căn giữa
            const extraPadding = 10;
            scrollY = Math.max(-extraPadding, Math.min(0, scrollY));
        } else {
            scrollY = Math.max(0, Math.min(maxScrollY, scrollY));
        }
        
        return { scrollX, scrollY };
    };
    
    // Reset scroll position để đảm bảo border hiển thị đầy đủ
    const resetToProperPosition = () => {
        const { maxScrollX, maxScrollY, scaledCanvasWidth, scaledCanvasHeight } = updateScrollLimits();
        const wrapperRect = wrapper.getBoundingClientRect();
        
        let newScrollX = wrapper.scrollLeft;
        let newScrollY = wrapper.scrollTop;
        
        // Nếu canvas nhỏ hơn wrapper, căn giữa
        if (scaledCanvasWidth <= wrapperRect.width) {
            newScrollX = -5; // Scroll nhẹ để border hiển thị đầy đủ
        } else {
            newScrollX = Math.min(maxScrollX, newScrollX);
        }
        
        if (scaledCanvasHeight <= wrapperRect.height) {
            newScrollY = -5; // Scroll nhẹ để border hiển thị đầy đủ
        } else {
            newScrollY = Math.min(maxScrollY, newScrollY);
        }
        
        wrapper.scrollLeft = newScrollX;
        wrapper.scrollTop = newScrollY;
    };
    
    wrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        wrapper.style.cursor = 'grabbing';
        startX = e.pageX - wrapper.offsetLeft;
        startY = e.pageY - wrapper.offsetTop;
        scrollLeft = wrapper.scrollLeft;
        scrollTop = wrapper.scrollTop;
    });
    
    wrapper.addEventListener('mouseleave', () => {
        isDragging = false;
        wrapper.style.cursor = 'grab';
    });
    
    wrapper.addEventListener('mouseup', () => {
        isDragging = false;
        wrapper.style.cursor = 'grab';
        // Sau khi kéo xong, đảm bảo vị trí scroll hợp lệ
        resetToProperPosition();
    });
    
    wrapper.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const x = e.pageX - wrapper.offsetLeft;
        const y = e.pageY - wrapper.offsetTop;
        const walkX = (x - startX) * 2;
        const walkY = (y - startY) * 2;
        
        // Calculate new scroll position
        let newScrollLeft = scrollLeft - walkX;
        let newScrollTop = scrollTop - walkY;
        
        // Apply constraints
        const constrained = constrainScroll(newScrollLeft, newScrollTop);
        
        wrapper.scrollLeft = constrained.scrollX;
        wrapper.scrollTop = constrained.scrollY;
    });
    
    // Zoom support with proper scroll area update
    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        
        // Calculate new scale
        const newScale = Math.max(0.5, Math.min(5, currentScale * delta));
        
        // Get current scroll and dimensions before zoom
        const wrapperRect = wrapper.getBoundingClientRect();
        const mouseX = e.clientX - wrapperRect.left + wrapper.scrollLeft;
        const mouseY = e.clientY - wrapperRect.top + wrapper.scrollTop;
        
        // Calculate scale change
        const scaleChange = newScale / currentScale;
        
        // Update scale
        currentScale = newScale;
        canvas.style.transform = `scale(${currentScale})`;
        
        // Force reflow để cập nhật kích thước
        canvas.getBoundingClientRect();
        
        // Adjust scroll position to keep zoom centered on mouse
        requestAnimationFrame(() => {
            let newScrollX = mouseX * scaleChange - (e.clientX - wrapperRect.left);
            let newScrollY = mouseY * scaleChange - (e.clientY - wrapperRect.top);
            
            // Apply constraints
            const constrained = constrainScroll(newScrollX, newScrollY);
            
            wrapper.scrollLeft = constrained.scrollX;
            wrapper.scrollTop = constrained.scrollY;
            
            // Đảm bảo border không bị cắt sau khi zoom
            setTimeout(resetToProperPosition, 50);
        });
    });
    
    // Reset scroll khi vẽ lại pinmap
    const resetScroll = () => {
        currentScale = 1;
        canvas.style.transform = 'scale(1)';
        
        // Sau khi reset scale, đặt scroll position phù hợp
        setTimeout(() => {
            resetToProperPosition();
        }, 100);
    };
    
    // Set initial cursor
    wrapper.style.cursor = 'grab';
    
    // Update wrapper overflow to enable scrolling
    wrapper.style.overflow = 'auto';
    
    // Khởi tạo vị trí scroll ban đầu
    setTimeout(resetToProperPosition, 100);
    
    // Return reset function để có thể gọi từ bên ngoài
    return { resetScroll };
}

function savePinMapImage() {
    const canvas = document.getElementById('pinmap-canvas');
    const link = document.createElement('a');
    link.download = `pinmap_${AppState.currentProduct}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ===== Utility Functions =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function clearPinFill() {
    const choice = confirm('Clear ALL fill color pins (OK) or only CUSTOM fill color pins (Cancel)?');
    
    if (choice) {
        // Clear tất cả
        AppState.currentPins = [];
        AppState.customPins = [];
        console.log('Cleared all pin colors');
    } else {
        // Chỉ clear custom pins
        AppState.customPins = [];
        console.log('Cleared custom pin colors only');
    }
    
    drawPinMap();
}

function flipHorizontal() {
    if (!AppState.currentProduct || !AppState.pinmapData[AppState.currentProduct]) {
        return;
    }
    
    const pinmapData = AppState.pinmapData[AppState.currentProduct];
    const maxX = Math.max(...pinmapData.map(p => p.x));
    
    // Flip all X coordinates
    for (let i = 0; i < pinmapData.length; i++) {
        pinmapData[i].x = maxX - pinmapData[i].x;
    }
    
    // Recalculate pin 1 based on new coordinates
    AppState.currentPin1 = findPin1(pinmapData);
    console.log(`After horizontal flip - Pin 1: ${AppState.currentPin1.pinName} at (${AppState.currentPin1.x}, ${AppState.currentPin1.y})`);
    
    drawPinMap();
}

function flipVertical() {
    if (!AppState.currentProduct || !AppState.pinmapData[AppState.currentProduct]) {
        return;
    }
    
    const pinmapData = AppState.pinmapData[AppState.currentProduct];
    const maxY = Math.max(...pinmapData.map(p => p.y));
    
    // Flip all Y coordinates
    for (let i = 0; i < pinmapData.length; i++) {
        pinmapData[i].y = maxY - pinmapData[i].y;
    }
    
    // Recalculate pin 1 based on new coordinates
    AppState.currentPin1 = findPin1(pinmapData);
    console.log(`After vertical flip - Pin 1: ${AppState.currentPin1.pinName} at (${AppState.currentPin1.x}, ${AppState.currentPin1.y})`);
    
    drawPinMap();
}
function rotateRight() {
    if (!AppState.currentProduct || !AppState.pinmapData[AppState.currentProduct]) {
        return;
    }
    
    const pinmapData = AppState.pinmapData[AppState.currentProduct];
    const maxX = Math.max(...pinmapData.map(p => p.x));
    const maxY = Math.max(...pinmapData.map(p => p.y));
    
    // Rotate 90 degrees counter-clockwise: (x, y) -> (y, maxX - x)
    for (let i = 0; i < pinmapData.length; i++) {
        const oldX = pinmapData[i].x;
        const oldY = pinmapData[i].y;
        pinmapData[i].x = oldY;
        pinmapData[i].y = maxX - oldX;
    }
    
    // Recalculate pin 1 based on new coordinates
    AppState.currentPin1 = findPin1(pinmapData);
    console.log(`After 90° left rotation - Pin 1: ${AppState.currentPin1.pinName} at (${AppState.currentPin1.x}, ${AppState.currentPin1.y})`);
    
    drawPinMap();
}

function rotateLeft() {
    if (!AppState.currentProduct || !AppState.pinmapData[AppState.currentProduct]) {
        return;
    }
    
    const pinmapData = AppState.pinmapData[AppState.currentProduct];
    const maxX = Math.max(...pinmapData.map(p => p.x));
    const maxY = Math.max(...pinmapData.map(p => p.y));
    
    // Rotate 90 degrees clockwise: (x, y) -> (maxY - y, x)
    for (let i = 0; i < pinmapData.length; i++) {
        const oldX = pinmapData[i].x;
        const oldY = pinmapData[i].y;
        pinmapData[i].x = maxY - oldY;
        pinmapData[i].y = oldX;
    }
    
    // Recalculate pin 1 based on new coordinates
    AppState.currentPin1 = findPin1(pinmapData);
    console.log(`After 90° right rotation - Pin 1: ${AppState.currentPin1.pinName} at (${AppState.currentPin1.x}, ${AppState.currentPin1.y})`);
    
    drawPinMap();
}

function increasePinSpacing() {
    AppState.pinScale = Math.min(50, AppState.pinScale + 2);
    console.log(`Pin spacing increased to: ${AppState.pinScale}`);
    drawPinMap();
}

function decreasePinSpacing() {
    AppState.pinScale = Math.max(10, AppState.pinScale - 2);
    console.log(`Pin spacing decreased to: ${AppState.pinScale}`);
    drawPinMap();
}

function savePinMapData() {
    if (!AppState.currentProduct || !AppState.pinmapData[AppState.currentProduct]) {
        alert('No pinmap data to save!');
        return;
    }
    
    const pinmapData = AppState.pinmapData[AppState.currentProduct];
    let csvContent = '';
    
    pinmapData.forEach(pin => {
        const line = [
            pin.pinName,
            pin.name,
            pin.components,
            pin.x * AppState.pinScale / 20,  // Nhân với scale ratio
            pin.y * AppState.pinScale / 20,  // Nhân với scale ratio
            pin.site0 || '',
            pin.site2 || '',
            pin.site4 || '',
            pin.site6 || ''
        ].join(';');
        csvContent += line + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${AppState.currentProduct}_scaled_${Date.now()}.pinmap`;
    link.click();
    URL.revokeObjectURL(link.href);
}