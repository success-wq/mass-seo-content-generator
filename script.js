//v8 (referenced previous v18)
class SEOGenerator {
    constructor() {
        console.log('SEOGenerator constructor called');
        
        // Get DOM elements
        this.form = document.getElementById('seoForm');
        this.resultsSection = document.getElementById('results');
        this.matrixPreview = document.getElementById('matrixPreview');
        this.statusMessage = document.getElementById('statusMessage');
        this.submitBtn = document.getElementById('submitBtn');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.keywordsDisplay = document.getElementById('keywordsDisplay');
        this.keywordsList = document.getElementById('keywordsList');
        this.keywordCount = document.getElementById('keywordCount');
        this.promptTypeSelect = document.getElementById('promptType');
        this.addLocationBtn = document.getElementById('addLocationBtn');
        this.locationsContainer = document.getElementById('locationsContainer');
        
        // Initialize data
        this.currentMatrix = [];
        this.loadedKeywords = [];
        this.promptTypes = [];
        this.locationCount = 1;
        this.sheetsData = {
            docNames: [],
            keywordsMap: {}
        };
        
        this.init();
    }
    
    init() {
        console.log('SEOGenerator init() called');
        
        // Add event listeners with safety checks
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        if (this.darkModeToggle) {
            this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
        
        if (this.promptTypeSelect) {
            this.promptTypeSelect.addEventListener('change', () => this.handlePromptTypeChange());
        }
        
        if (this.addLocationBtn) {
            this.addLocationBtn.addEventListener('click', () => this.addLocationInput());
        }
        
        console.log('Event listeners attached');
        
        // Initialize features
        this.initDarkMode();
        this.loadInitialSheetsData();
    }
    
    initDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }
    
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        console.log('Dark mode toggled:', isDarkMode);
    }
    
    async loadInitialSheetsData() {
        console.log('loadInitialSheetsData() called');
        
        const webAppUrl = 'https://script.google.com/macros/s/AKfycbxjKNjowmwUDYVmZONXf6NRUTNif4GmUQT9iN8C39sCV-mF6U4HpjvUlrmps09NUYAl/exec';
        
        try {
            console.log('Calling fetchFromWebApp with URL:', webAppUrl);
            this.showStatus('Loading data from Google Apps Script...', 'info');
            await this.fetchFromWebApp(webAppUrl);
        } catch (error) {
            console.error('Failed to load data from web app:', error);
            this.showStatus('Failed to load data from Google Sheets Web App. Please check the deployment.', 'error');
        }
    }
    
    async fetchFromWebApp(webAppUrl) {
        console.log('fetchFromWebApp() called');
        
        try {
            const data = await this.fetchViaJSONP(webAppUrl);
            console.log('JSONP data received:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            this.mapWebAppDataToUI(data);
            this.showStatus('Successfully loaded data from Google Apps Script!', 'success');
            
        } catch (error) {
            console.error('fetchFromWebApp error:', error);
            throw error;
        }
    }
    
    fetchViaJSONP(url) {
        return new Promise((resolve, reject) => {
            const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            const urlWithCallback = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
            
            console.log('JSONP URL:', urlWithCallback);
            
            const script = document.createElement('script');
            script.src = urlWithCallback;
            
            window[callbackName] = function(data) {
                console.log('JSONP callback received:', data);
                resolve(data);
                document.head.removeChild(script);
                delete window[callbackName];
            };
            
            script.onerror = function() {
                console.error('JSONP script failed to load');
                reject(new Error('JSONP request failed'));
                document.head.removeChild(script);
                delete window[callbackName];
            };
            
            document.head.appendChild(script);
            
            setTimeout(() => {
                if (window[callbackName]) {
                    console.error('JSONP request timed out');
                    reject(new Error('JSONP request timed out'));
                    if (document.head.contains(script)) {
                        document.head.removeChild(script);
                    }
                    delete window[callbackName];
                }
            }, 10000);
        });
    }
    
    mapWebAppDataToUI(jsonData) {
        console.log('mapWebAppDataToUI called with:', jsonData);
        
        if (!jsonData.prompt_types || !Array.isArray(jsonData.prompt_types)) {
            throw new Error('Invalid data format: prompt_types array not found');
        }
        
        if (!jsonData.keywords_map || typeof jsonData.keywords_map !== 'object') {
            throw new Error('Invalid data format: keywords_map object not found');
        }
        
        this.sheetsData = {
            docNames: jsonData.prompt_types,
            keywordsMap: jsonData.keywords_map
        };
        
        console.log('Mapped data:', this.sheetsData);
        this.updatePromptTypesFromSheets();
    }
    
    updatePromptTypesFromSheets() {
        console.log('updatePromptTypesFromSheets called');
        
        if (this.sheetsData.docNames.length === 0) {
            this.showStatus('No prompt types found in Google Sheets', 'error');
            return;
        }
        
        this.promptTypes = [...this.sheetsData.docNames];
        this.updatePromptTypeOptions();
        
        this.showStatus(`Loaded ${this.promptTypes.length} prompt types from Google Sheets`, 'success');
    }
    
    updatePromptTypeOptions() {
        console.log('updatePromptTypeOptions called with:', this.promptTypes);
        
        if (!this.promptTypeSelect) return;
        
        this.promptTypeSelect.innerHTML = '<option value="">Select prompt type...</option>';
        
        this.promptTypes.forEach(promptType => {
            const option = document.createElement('option');
            option.value = promptType;
            option.textContent = this.formatPromptTypeName(promptType);
            this.promptTypeSelect.appendChild(option);
            console.log(`Added option: ${promptType}`);
        });
    }
    
    formatPromptTypeName(docName) {
        return docName.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    handlePromptTypeChange() {
        const selectedPrompt = this.promptTypeSelect.value;
        
        if (selectedPrompt) {
            if (this.sheetsData && this.sheetsData.keywordsMap[selectedPrompt]) {
                this.loadKeywordsForSelectedPrompt(selectedPrompt);
            } else {
                this.showStatus(`Selected prompt type: ${this.formatPromptTypeName(selectedPrompt)}`, 'info');
            }
        } else {
            if (this.keywordsDisplay) {
                this.keywordsDisplay.style.display = 'none';
            }
            this.loadedKeywords = [];
        }
    }
    
    loadKeywordsForSelectedPrompt(selectedDocName) {
        if (this.sheetsData.keywordsMap[selectedDocName]) {
            this.loadedKeywords = [...this.sheetsData.keywordsMap[selectedDocName]];
            this.displayKeywords(this.loadedKeywords);
            this.showStatus(`Loaded ${this.loadedKeywords.length} keywords for "${selectedDocName}"`, 'success');
        } else {
            if (this.keywordsDisplay) {
                this.keywordsDisplay.style.display = 'none';
            }
            this.loadedKeywords = [];
            this.showStatus(`No keywords found for "${selectedDocName}"`, 'error');
        }
    }
    
    displayKeywords(keywords) {
        if (this.keywordCount) {
            this.keywordCount.textContent = `${keywords.length} keywords`;
        }
        
        if (this.keywordsList) {
            const keywordTags = keywords.map(keyword => 
                `<span class="keyword-tag">${keyword}</span>`
            ).join('');
            this.keywordsList.innerHTML = keywordTags;
        }
        
        if (this.keywordsDisplay) {
            this.keywordsDisplay.style.display = 'block';
        }
    }
    
    addLocationInput() {
        this.locationCount++;
        
        const locationGroup = document.createElement('div');
        locationGroup.className = 'location-input-group';
        locationGroup.innerHTML = `
            <input 
                type="text" 
                id="cityState${this.locationCount}" 
                placeholder="Enter city and state (e.g. Boston, MA)"
                required
            >
            <button type="button" class="remove-location-btn" onclick="this.parentElement.remove()">Remove</button>
        `;
        
        this.locationsContainer.appendChild(locationGroup);
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        const formData = this.getFormData();
        if (!this.validateFormData(formData)) return;
        
        this.showLoading(true);
        this.hideStatus();
        
        try {
            await this.sendToWebhook(formData);
            
            const matrix = this.generateMatrix(formData);
            this.currentMatrix = matrix;
            this.displayMatrix(matrix);
            this.showResults();
            this.showStatus('Matrix generated successfully and data sent to webhook!', 'success');
        } catch (error) {
            console.error('handleFormSubmit error:', error);
            this.showStatus('Error: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async sendToWebhook(formData) {
        const webhookUrl = 'https://bsmteam.app.n8n.cloud/webhook/cd1e701b-9bed-4ea3-840e-d838267ab5b7';
        
        const payload = [
            {
                "selection": formData.promptType || "",
                "keyword": "",
                "location": formData.locations.join(', ') || "",
                "company_name": formData.companyName || "",
                "company_url": formData.websiteUrl || "",
                "user": formData.userName || ""
            }
        ];
        
        console.log('Sending payload to webhook:', payload);
        
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Webhook response:', result);
            
        } catch (error) {
            console.error('Webhook error:', error);
            console.warn('Webhook failed, but continuing with matrix generation');
        }
    }
    
    getFormData() {
        const getData = (id) => {
            const element = document.getElementById(id);
            return element ? element.value.trim() : '';
        };
        
        // Get all location inputs
        const locations = [];
        const locationInputs = this.locationsContainer.querySelectorAll('input[type="text"]');
        locationInputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                locations.push(value);
            }
        });
        
        return {
            promptType: this.promptTypeSelect ? this.promptTypeSelect.value.trim() : '',
            locations: locations,
            companyName: getData('companyName'),
            userName: getData('userName'),
            websiteUrl: getData('websiteUrl'),
            keywords: this.loadedKeywords
        };
    }
    
    validateFormData(data) {
        if (!data.promptType) {
            this.showStatus('Please select a prompt type', 'error');
            return false;
        }
        
        if (!data.locations || data.locations.length === 0) {
            this.showStatus('Please enter at least one city and state', 'error');
            return false;
        }
        
        if (!data.companyName) {
            this.showStatus('Please enter company name', 'error');
            return false;
        }
        
        if (!data.userName) {
            this.showStatus('Please enter your name', 'error');
            return false;
        }
        
        if (!data.websiteUrl) {
            this.showStatus('Please enter your website URL', 'error');
            return false;
        }
        
        if (!data.keywords || data.keywords.length === 0) {
            this.showStatus('No keywords loaded. Please select a prompt type first.', 'error');
            return false;
        }
        
        return true;
    }
    
    generateMatrix(data) {
        const { locations, keywords, websiteUrl } = data;
        
        const baseUrl = websiteUrl.replace(/\/$/, '');
        const matrix = [];
        
        matrix.push({
            type: 'header',
            city: 'City',
            state: 'State', 
            keyword: 'Service Keyword',
            urlSlug: 'URL Slug',
            fullUrl: 'Full URL',
            pageTitle: 'Page Title'
        });
        
        locations.forEach(location => {
            const cityStateParts = location.split(',').map(part => part.trim());
            const city = cityStateParts[0];
            const state = cityStateParts[1] || '';
            
            keywords.forEach(keyword => {
                const urlSlug = this.generateUrlSlug(city, state, keyword);
                const fullUrl = `${baseUrl}${urlSlug}`;
                const pageTitle = this.generatePageTitle(city, state, keyword);
                
                matrix.push({
                    type: 'data',
                    city: city,
                    state: state,
                    keyword: keyword,
                    urlSlug: urlSlug,
                    fullUrl: fullUrl,
                    pageTitle: pageTitle
                });
            });
        });
        
        return matrix;
    }
    
    generateUrlSlug(city, state, keyword) {
        const cleanCity = city.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const cleanKeyword = keyword.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
            
        return `/locations/${cleanCity}/${cleanKeyword}`;
    }
    
    generatePageTitle(city, state, keyword) {
        const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
        const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
        
        return `${capitalizedKeyword} in ${capitalizedCity}, ${state}`;
    }
    
    displayMatrix(matrix) {
        if (!this.matrixPreview) return;
        
        if (matrix.length === 0) {
            this.matrixPreview.innerHTML = '<p>No data generated</p>';
            return;
        }
        
        let html = '<div class="matrix-grid" style="grid-template-columns: repeat(6, 1fr);">';
        
        matrix.forEach(row => {
            const isHeader = row.type === 'header';
            const className = isHeader ? 'matrix-item matrix-header' : 'matrix-item';
            
            html += '<div class="' + className + '">' + row.city + '</div>';
            html += '<div class="' + className + '">' + row.state + '</div>';
            html += '<div class="' + className + '">' + row.keyword + '</div>';
            html += '<div class="' + className + '">' + row.urlSlug + '</div>';
            html += '<div class="' + className + '">' + (row.fullUrl || 'Full URL') + '</div>';
            html += '<div class="' + className + '">' + row.pageTitle + '</div>';
        });
        
        html += '</div>';
        
        const dataRows = matrix.filter(row => row.type === 'data');
        html += `<p><strong>Total combinations generated: ${dataRows.length}</strong></p>`;
        
        this.matrixPreview.innerHTML = html;
    }
    
    showResults() {
        if (this.resultsSection) {
            this.resultsSection.style.display = 'block';
            this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    showLoading(show) {
        if (!this.submitBtn) return;
        
        const btnText = this.submitBtn.querySelector('.btn-text');
        const loader = this.submitBtn.querySelector('.loader');
        
        if (show) {
            if (btnText) btnText.style.display = 'none';
            if (loader) loader.style.display = 'inline-block';
            this.submitBtn.disabled = true;
        } else {
            if (btnText) btnText.style.display = 'inline-block';
            if (loader) loader.style.display = 'none';
            this.submitBtn.disabled = false;
        }
    }
    
    showStatus(message, type) {
        if (!this.statusMessage) return;
        
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        this.statusMessage.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => this.hideStatus(), 5000);
        }
    }
    
    hideStatus() {
        if (this.statusMessage) {
            this.statusMessage.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    
    try {
        const seoGenerator = new SEOGenerator();
        console.log('SEOGenerator instance created successfully');
        window.seoGenerator = seoGenerator;
    } catch (error) {
        console.error('Error creating SEOGenerator:', error);
        console.error('Error stack:', error.stack);
    }
});
