const { createApp, ref, reactive, onMounted } = Vue;

createApp({
    setup() {
        const status = ref('READY');
        
        const hierarchy = reactive({
            processPlan: '',
            beolOption: '',
            partId: '',
            productName: ''
        });

        // DB Selection Logic
        const dbHierarchy = ref([]);
        const selectionMode = ref('new');
        const dbSelection = reactive({
            selectedPP: null,
            selectedBO: null
        });

        const loadDbHierarchy = async () => {
            try {
                const data = await window.apiClient.getHierarchy();
                dbHierarchy.value = data;
            } catch (err) {
                console.error('Failed to load hierarchy:', err);
            }
        };

        const selectPP = (pp) => {
            dbSelection.selectedPP = pp;
            dbSelection.selectedBO = null;
        };

        const selectBO = (bo) => {
            dbSelection.selectedBO = bo;
        };

        const selectFromDb = (prod, bo, pp) => {
            hierarchy.processPlan = pp.design_rule;
            hierarchy.beolOption = bo.option_name;
            hierarchy.partId = prod.partid;
            hierarchy.productName = prod.product_name;
            selectionMode.value = 'new';
        };

        const parseAndPreview = async () => {
            if (!hierarchy.partId) { alert('Please enter or select Hierarchy info.'); return; }
            
            status.value = 'PARSING';
            try {
                // Call bridge to parse the ACTIVE workbook
                const result = await window.chrome.webview.hostObjects.bridge.loader.ParseActiveWorkbook();
                
                if (result.startsWith('Error')) {
                    status.value = 'ERROR';
                    alert('Parsing failed: ' + result);
                    return;
                }

                const data = JSON.parse(result);
                if (data) {
                    // Open the same preview window as Folder Loader
                    // results array with single item
                    await window.chrome.webview.hostObjects.bridge.loader.ShowPreview(
                        JSON.stringify([data]), 
                        JSON.stringify(hierarchy)
                    );
                    status.value = 'READY';
                }
            } catch (err) {
                status.value = 'ERROR';
                console.error('Active parsing failed:', err);
            }
        };

        onMounted(loadDbHierarchy);

        return { 
            status, hierarchy, selectionMode, dbHierarchy, dbSelection,
            loadDbHierarchy, selectPP, selectBO, selectFromDb, parseAndPreview
        };
    }
}).mount('#app');