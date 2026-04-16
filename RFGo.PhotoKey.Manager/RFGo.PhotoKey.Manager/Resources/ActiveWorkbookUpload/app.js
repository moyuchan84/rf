const { createApp, ref, reactive, onMounted } = Vue;

createApp({
    setup() {
        const status = ref('READY');
        const isAuthorized = ref(false);
        const userInfo = ref(null);
        
        const hierarchy = reactive({
            processPlan: '',
            beolOption: '',
            partId: '',
            productName: ''
        });

        // DB 선택 전용 상태 (3단계: PP -> BG -> Prod)
        const dbHierarchy = ref([]);
        const selectionMode = ref('new');
        const dbSelection = reactive({
            selectedPP: null, // ProcessPlan
            selectedBG: null  // BeolGroup
        });

        const checkPermission = async () => {
            try {
                const infoRaw = await window.chrome.webview.hostObjects.bridge.GetUserInfo();
                if (infoRaw) {
                    const user = JSON.parse(infoRaw);
                    userInfo.value = user;
                    // Only ADMIN or INNO roles can access
                    isAuthorized.value = user.Roles && user.Roles.some(r => ['ADMIN', 'INNO'].includes(r));
                }
            } catch (err) {
                console.error('Permission check failed:', err);
            }
            
            if (!isAuthorized.value) {
                alert('이 기능을 사용할 권한이 없습니다. (ADMIN, INNO 전용)');
                status.value = 'UNAUTHORIZED';
            }
        };

        const loadDbHierarchy = async () => {
            if (!isAuthorized.value) return;
            try {
                // Use the same API as WorkSheetsLoader
                const data = await window.apiClient.getHierarchy();
                dbHierarchy.value = data;
            } catch (err) {
                console.error('Failed to load hierarchy:', err);
            }
        };

        const selectPP = (pp) => {
            dbSelection.selectedPP = pp;
            dbSelection.selectedBG = null;
        };

        const selectBG = (bg) => {
            dbSelection.selectedBG = bg;
        };

        const selectFromDb = (prod, bg, pp) => {
            hierarchy.processPlan = pp.design_rule;
            hierarchy.beolOption = prod.beol_option_name || ""; 
            hierarchy.partId = prod.partid;
            hierarchy.productName = prod.product_name;
            selectionMode.value = 'new';
        };

        const parseAndPreview = async () => {
            if (!isAuthorized.value) return;
            if (!hierarchy.partId) { alert('Please enter or select Hierarchy info.'); return; }
            
            status.value = 'PARSING';
            try {
                const result = await window.chrome.webview.hostObjects.bridge.loader.ParseActiveWorkbook();
                
                if (result.startsWith('Error')) {
                    status.value = 'ERROR';
                    alert('Parsing failed: ' + result);
                    return;
                }

                const data = JSON.parse(result);
                if (data) {
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

        onMounted(async () => {
            await checkPermission();
            if (isAuthorized.value) {
                await loadDbHierarchy();
            }
        });

        return { 
            status, hierarchy, selectionMode, dbHierarchy, dbSelection, isAuthorized, userInfo,
            loadDbHierarchy, selectPP, selectBG, selectFromDb, parseAndPreview
        };
    }
}).mount('#app');
