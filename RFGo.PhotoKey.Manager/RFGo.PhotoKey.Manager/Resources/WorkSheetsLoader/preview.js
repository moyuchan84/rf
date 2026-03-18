const { createApp, ref, reactive, watch } = Vue;

const app = createApp({
    setup() {
        const parsedWorkbooks = ref([]);
        const hierarchy = ref(null);
        const activeWorkbook = ref(null);
        const activeSheet = ref(null);
        const status = ref('READY');
        const isDetail = ref(false);

        const selectedWorkbooks = ref([]); 
        const selectedSheets = ref([]);    

        window.initPreview = async (data) => {
            const workbooks = typeof data.workbooks === 'string' ? JSON.parse(data.workbooks) : data.workbooks;
            isDetail.value = data.isDetail || false;
            hierarchy.value = JSON.parse(data.hierarchy);
            
            for (const wb of workbooks) {
                // 1. C#에서 파싱해온 제안된 테이블명 (2번째 시트) 사용
                const suggestedName = wb.Meta.SuggestedTableName || wb.Meta.FileName;
                
                // 2. C#에서 파싱한 Revision 사용, 없으면 1
                let rev = wb.Meta.Revision || 1;

                // 3. DB에서 현재 productId + tableName 기준 가장 큰 rev_no 확인하여 제안
                try {
                    const dbResult = await window.apiClient.getNextRevision(hierarchy.value.partId, suggestedName);
                    if (dbResult && dbResult.next_rev > 1) {
                        rev = dbResult.next_rev;
                    }
                } catch (e) {
                    console.warn('Failed to fetch next revision from DB:', e);
                }

                wb.config = reactive({
                    rfgCategory: wb.Config?.rfgCategory || 'common',
                    photoCategory: wb.Config?.photoCategory || 'key',
                    tableName: wb.Config?.tableName || suggestedName,
                    revNo: wb.Config?.revNo || rev,
                    isReference: wb.Config?.isReference || false,
                    log: wb.Config?.log || ''
                });

                // 테이블명 변경 시 rev_no 자동 업데이트 감시
                watch(() => wb.config.tableName, async (newName) => {
                    try {
                        const res = await window.apiClient.getNextRevision(hierarchy.value.partId, newName);
                        wb.config.revNo = res.next_rev;
                    } catch (e) {}
                });
            }

            parsedWorkbooks.value = workbooks;
            
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
            selectedSheets.value = selectedSheets.value.filter(k => k !== key);
            closeContextMenu();
        };

        const saveAll = async () => {
            if (selectedSheets.value.length === 0) {
                alert('업로드할 시트를 하나 이상 선택해주세요.');
                return;
            }

            status.value = 'CHECKING';
            
            // 중복 체크 (Existing Table & Rev)
            for (const wb of parsedWorkbooks.value) {
                if (selectedWorkbooks.value.includes(wb.Meta.FullPath)) {
                    try {
                        const existsRes = await window.apiClient.checkExistence(
                            hierarchy.value.partId, 
                            wb.config.tableName, 
                            wb.config.revNo
                        );
                        if (existsRes.exists) {
                            const proceed = confirm(`경고: [${wb.config.tableName}] Rev.${wb.config.revNo} 테이블이 이미 DB에 존재합니다. 무시하고 덮어쓰시겠습니까?`);
                            if (!proceed) {
                                status.value = 'READY';
                                return;
                            }
                        }
                    } catch (e) {
                        console.error('Existence check failed:', e);
                    }
                }
            }

            status.value = 'UPLOADING';
            try {
                const filteredData = parsedWorkbooks.value
                    .filter(w => selectedWorkbooks.value.includes(w.Meta.FullPath))
                    .map(w => {
                        return {
                            Meta: w.Meta,
                            Config: w.config,
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
                alert(`업로드 완료.`);

            } catch (err) {
                status.value = 'ERROR';
                alert('업로드 중 오류 발생: ' + err.message);
            }
        };

        const restoreActive = async () => {
            if (!activeWorkbook.value) return;
            try {
                if (window.chrome?.webview?.hostObjects?.bridge?.inquiry) {
                    await window.chrome.webview.hostObjects.bridge.inquiry.RestoreToExcel(
                        JSON.stringify([activeWorkbook.value])
                    );
                }
            } catch (err) {
                alert('Restore failed: ' + err.message);
            }
        };

        return {
            parsedWorkbooks, hierarchy, activeWorkbook, activeSheet, status, isDetail,
            selectedWorkbooks, selectedSheets, contextMenu,
            selectWorkbook, toggleAllWorkbooks, selectAllWorkbooks, deselectAllWorkbooks,
            toggleAllSheetsInActiveWorkbook, selectAllSheetsInActiveWorkbook, deselectAllSheetsInActiveWorkbook,
            showWorkbookContextMenu, showSheetContextMenu, closeContextMenu, saveAll, restoreActive
        };
    }
});

app.mount('#app');
