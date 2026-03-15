const { createApp, ref, reactive, watch } = Vue;

const app = createApp({
    setup() {
        const parsedWorkbooks = ref([]);
        const hierarchy = ref(null);
        const activeWorkbook = ref(null);
        const activeSheet = ref(null);
        const status = ref('READY');

        const selectedWorkbooks = ref([]); 
        const selectedSheets = ref([]);    

        window.initPreview = (data) => {
            const workbooks = JSON.parse(data.workbooks);
            
            workbooks.forEach(wb => {
                const dataSheet = wb.Worksheets.find(s => s.SheetType === 'DATA') || wb.Worksheets[0];
                const defaultTableName = dataSheet ? dataSheet.SheetName : wb.Meta.FileName;

                // Workbook별 설정 객체 초기화
                wb.config = reactive({
                    rfgCategory: 'common',
                    photoCategory: 'key',
                    tableName: defaultTableName,
                    revNo: 1,
                    isReference: false
                });
            });

            parsedWorkbooks.value = workbooks;
            hierarchy.value = JSON.parse(data.hierarchy);
            
            selectedWorkbooks.value = workbooks.map(w => w.Meta.FullPath);
            selectedSheets.value = [];
            workbooks.forEach(w => {
                w.Worksheets.forEach(s => {
                    selectedSheets.value.push(`${w.Meta.FullPath}::${s.SheetName}`);
                });
            });

            if (parsedWorkbooks.value.length > 0) {
                selectWorkbook(parsedWorkbooks.value[0]);
            }
        };

        watch(selectedWorkbooks, (newList, oldList) => {
            const added = newList.filter(x => !oldList.includes(x));
            const removed = oldList.filter(x => !newList.includes(x));

            added.forEach(path => {
                const wb = parsedWorkbooks.value.find(w => w.Meta.FullPath === path);
                if (wb) {
                    wb.Worksheets.forEach(s => {
                        const key = `${path}::${s.SheetName}`;
                        if (!selectedSheets.value.includes(key)) selectedSheets.value.push(key);
                    });
                }
            });

            removed.forEach(path => {
                const wb = parsedWorkbooks.value.find(w => w.Meta.FullPath === path);
                if (wb) {
                    wb.Worksheets.forEach(s => {
                        const key = `${path}::${s.SheetName}`;
                        selectedSheets.value = selectedSheets.value.filter(k => k !== key);
                    });
                }
            });
        });

        const selectWorkbook = (workbook) => {
            activeWorkbook.value = workbook;
            if (workbook.Worksheets && workbook.Worksheets.length > 0) {
                activeSheet.value = workbook.Worksheets[0];
            } else {
                activeSheet.value = null;
            }
        };

        const contextMenu = reactive({ visible: false, x: 0, y: 0, type: '' });
        const showWorkbookContextMenu = (e) => { contextMenu.x = e.clientX; contextMenu.y = e.clientY; contextMenu.type = 'workbook'; contextMenu.visible = true; };
        const showSheetContextMenu = (e) => { if (!activeWorkbook.value) return; contextMenu.x = e.clientX; contextMenu.y = e.clientY; contextMenu.type = 'sheet'; contextMenu.visible = true; };
        const closeContextMenu = () => { contextMenu.visible = false; };

        const toggleAllWorkbooks = () => {
            if (selectedWorkbooks.value.length === parsedWorkbooks.value.length) { selectedWorkbooks.value = []; } 
            else { selectedWorkbooks.value = parsedWorkbooks.value.map(w => w.Meta.FullPath); }
        };

        const selectAllWorkbooks = () => { selectedWorkbooks.value = parsedWorkbooks.value.map(w => w.Meta.FullPath); closeContextMenu(); };
        const deselectAllWorkbooks = () => { selectedWorkbooks.value = []; closeContextMenu(); };

        const toggleAllSheetsInActiveWorkbook = () => {
            if (!activeWorkbook.value) return;
            const path = activeWorkbook.value.Meta.FullPath;
            const sheetKeys = activeWorkbook.value.Worksheets.map(s => `${path}::${s.SheetName}`);
            const allSelected = sheetKeys.every(k => selectedSheets.value.includes(k));
            if (allSelected) { selectedSheets.value = selectedSheets.value.filter(k => !sheetKeys.includes(k)); } 
            else { sheetKeys.forEach(k => { if (!selectedSheets.value.includes(k)) selectedSheets.value.push(k); }); }
        };

        const selectAllSheetsInActiveWorkbook = () => {
            if (!activeWorkbook.value) return;
            const path = activeWorkbook.value.Meta.FullPath;
            activeWorkbook.value.Worksheets.forEach(s => { const key = `${path}::${s.SheetName}`; if (!selectedSheets.value.includes(key)) selectedSheets.value.push(key); });
            closeContextMenu();
        };

        const deselectAllSheetsInActiveWorkbook = () => {
            if (!activeWorkbook.value) return;
            const path = activeWorkbook.value.Meta.FullPath;
            const sheetKeys = activeWorkbook.value.Worksheets.map(s => `${path}::${s.SheetName}`);
            selectedSheets.value = selectedSheets.value.filter(k => !sheetKeys.includes(k));
            closeContextMenu();
        };

        const saveAll = async () => {
            if (selectedSheets.value.length === 0) {
                alert('업로드할 시트를 하나 이상 선택해주세요.');
                return;
            }

            status.value = 'UPLOADING';
            try {
                // 중복 제거 및 데이터 구조 정제
                const filteredData = parsedWorkbooks.value
                    .filter(w => selectedWorkbooks.value.includes(w.Meta.FullPath))
                    .map(w => {
                        return {
                            Meta: w.Meta,
                            Config: w.config, // 'Config'로 통일 (C# 모델과 매칭)
                            Worksheets: w.Worksheets.filter(s => 
                                selectedSheets.value.includes(`${w.Meta.FullPath}::${s.SheetName}`)
                            )
                        };
                    })
                    .filter(w => w.Worksheets.length > 0);

                const payload = {
                    hierarchy: hierarchy.value,
                    workbooks: filteredData
                };
                
                const results = await window.apiClient.uploadPhotoKey(payload);
                status.value = 'READY';
                alert(`${results.length}개 파일 업로드 완료.`);

            } catch (err) {
                status.value = 'ERROR';
                alert('업로드 중 오류 발생: ' + err.message);
            }
        };

        return {
            parsedWorkbooks, hierarchy, activeWorkbook, activeSheet, status,
            selectedWorkbooks, selectedSheets, contextMenu,
            selectWorkbook, toggleAllWorkbooks, selectAllWorkbooks, deselectAllWorkbooks,
            toggleAllSheetsInActiveWorkbook, selectAllSheetsInActiveWorkbook, deselectAllSheetsInActiveWorkbook,
            showWorkbookContextMenu, showSheetContextMenu, closeContextMenu, saveAll
        };
    }
});

app.mount('#app');