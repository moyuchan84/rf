const { createApp, ref, reactive, watch, onMounted, computed } = Vue;

createApp({
    setup() {
        const folderPath = ref('');
        const files = ref([]);
        const selectedFiles = ref([]);
        const status = ref('');
        const parsingProgress = ref('');
        
        const hierarchy = reactive({
            processPlan: '',
            beolOption: '',
            partId: '',
            productName: ''
        });

        const clearHierarchy = () => {
            hierarchy.processPlan = '';
            hierarchy.beolOption = '';
            hierarchy.partId = '';
            hierarchy.productName = '';
            // DB 선택 상태도 초기화
            dbSelection.selectedPP = null;
            dbSelection.selectedBG = null;
        };

        // DB 선택 전용 상태 (3단계: PP -> BG -> Prod)
        const dbHierarchy = ref([]);
        const selectionMode = ref('new'); // 'new' or 'db'
        const dbSelection = reactive({
            selectedPP: null, // ProcessPlan
            selectedBG: null  // BeolGroup
        });

        const loadDbHierarchy = async () => {
            try {
                const data = await window.apiClient.getHierarchy();
                dbHierarchy.value = data;
            } catch (err) {
                console.error('Failed to load hierarchy:', err);
            }
        };

        onMounted(() => {
            loadDbHierarchy();
        });

        const selectPP = (pp) => {
            dbSelection.selectedPP = pp;
            dbSelection.selectedBG = null;
        };

        const selectBG = (bg) => {
            dbSelection.selectedBG = bg;
        };

        const selectFromDb = (prod, bg, pp) => {
            hierarchy.processPlan = pp.design_rule;
            hierarchy.beolOption = prod.beol_option_name || ""; // Flattened data includes beol_option_name
            hierarchy.partId = prod.partid;
            hierarchy.productName = prod.product_name;
            selectionMode.value = 'new';
        };

        const contextMenu = reactive({ visible: false, x: 0, y: 0 });

        watch(folderPath, (newPath) => {
            if (!newPath || selectionMode.value === 'db') return;
            const isAnyFieldFilled = hierarchy.processPlan || hierarchy.beolOption || hierarchy.partId || hierarchy.productName;
            if (isAnyFieldFilled) return;

            const folderName = newPath.split(/[\\/]/).pop();
            const parts = folderName.split('_');
            if (parts.length >= 4) {
                hierarchy.processPlan = parts[0];
                hierarchy.beolOption = parts[1];
                hierarchy.partId = parts[2];
                hierarchy.productName = parts.slice(3).join('_');
            }
        });

        const openFolderDialog = async () => {
            try {
                const path = await window.chrome.webview.hostObjects.bridge.loader.SelectFolder();
                if (path) { folderPath.value = path; await scanFiles(); }
            } catch (err) { console.error('Folder dialog failed:', err); }
        };

        const scanFiles = async () => {
            if (!folderPath.value) return;
            status.value = 'SCANNING';
            try {
                const result = await window.chrome.webview.hostObjects.bridge.loader.GetFiles(folderPath.value);
                if (result.startsWith('Error')) { status.value = 'ERROR'; } 
                else { files.value = JSON.parse(result); selectedFiles.value = []; status.value = 'READY'; }
            } catch (err) { status.value = 'ERROR'; }
        };

        const parseAndPreview = async () => {
            if (selectedFiles.value.length === 0) return;
            if (!hierarchy.partId) { alert('Hierarchy 정보를 입력하거나 선택해주세요.'); return; }
            
            status.value = 'PARSING';
            parsingProgress.value = `Processing ${selectedFiles.value.length} files in parallel...`;
            
            try {
                const filePaths = selectedFiles.value.map(f => f.FullPath);
                const result = await window.chrome.webview.hostObjects.bridge.loader.ParseFiles(JSON.stringify(filePaths));
                
                if (result.startsWith('Error')) {
                    status.value = 'ERROR';
                    alert('파일 파싱 중 오류 발생: ' + result);
                    return;
                }

                const results = JSON.parse(result);
                if (results && results.length > 0) {
                    await window.chrome.webview.hostObjects.bridge.loader.ShowPreview(JSON.stringify(results), JSON.stringify(hierarchy));
                    status.value = 'READY';
                    parsingProgress.value = '';
                } else {
                    status.value = 'ERROR';
                    alert('파싱된 결과가 없습니다.');
                }
            } catch (err) {
                status.value = 'ERROR';
                console.error('Batch parsing failed:', err);
            }
        };

        const showContextMenu = (e) => { contextMenu.x = e.clientX; contextMenu.y = e.clientY; contextMenu.visible = true; };
        const closeContextMenu = () => { contextMenu.visible = false; };
        const selectAll = () => { selectedFiles.value = [...files.value]; closeContextMenu(); };
        const deselectAll = () => { selectedFiles.value = []; closeContextMenu(); };

        return { 
            folderPath, files, selectedFiles, status, parsingProgress, hierarchy,
            contextMenu, dbHierarchy, selectionMode, dbSelection,
            openFolderDialog, scanFiles, parseAndPreview, showContextMenu,
            closeContextMenu, selectAll, deselectAll, selectFromDb, loadDbHierarchy, 
            clearHierarchy, selectPP, selectBG
        };
    }
}).mount('#app');
