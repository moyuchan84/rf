const { createApp, ref, onMounted, watch, computed, reactive } = Vue;

// --- Components ---

const HierarchyTree = {
    props: ['hierarchy', 'selectedProductId'],
    emits: ['select-product'],
    template: '#hierarchy-tree-template'
};

const RequestList = {
    props: ['requests', 'selectedRequestId', 'product'],
    emits: ['select-request', 'refresh'],
    setup(props) {
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };
        return { formatDate };
    },
    template: '#request-list-template'
};

const RequestPanel = {
    props: ['request', 'references', 'selectedRefs', 'status', 'folderStructure'],
    emits: ['close', 'toggle-ref', 'show-detail', 'load-excel', 'download-excel', 'update-folder-structure'],
    setup(props, { emit }) {
        const isSelected = (refItem) => props.selectedRefs.some(r => r.id === refItem.id);

        const isAllSelected = computed(() => {
            return props.references.length > 0 && props.selectedRefs.length === props.references.length;
        });

        const toggleAll = () => {
            if (isAllSelected.value) {
                props.references.forEach(r => {
                    if (isSelected(r)) emit('toggle-ref', r);
                });
            } else {
                props.references.forEach(r => {
                    if (!isSelected(r)) emit('toggle-ref', r);
                });
            }
        };

        return { isSelected, isAllSelected, toggleAll };
    },
    template: '#request-panel-template'
};

const SheetPreview = {
    props: ['workbook', 'activeSheet'],
    emits: ['back', 'select-sheet'],
    template: '#sheet-preview-template'
};

// --- Main App ---

const app = createApp({
    components: {
        HierarchyTree,
        RequestList,
        RequestPanel,
        SheetPreview
    },
    setup() {
        const hierarchy = ref([]);
        const requests = ref([]);
        const references = ref([]);
        const selectedProduct = ref(null);
        const selectedBO = ref(null);
        const selectedPP = ref(null);
        const selectedRequest = ref(null);
        const selectedRefs = ref([]);
        const status = ref('READY');

        const viewMode = ref('list'); // 'list', 'detail'
        const detailWorkbook = ref(null);
        const activeSheet = ref(null);

        const targetFolderPath = ref(localStorage.getItem('rfgo_target_path') || '');
        const folderStructure = ref(localStorage.getItem('rfgo_folder_structure') || 'nested');

        watch(targetFolderPath, (newPath) => {
            localStorage.setItem('rfgo_target_path', newPath);
        });

        watch(folderStructure, (val) => {
            localStorage.setItem('rfgo_folder_structure', val);
        });

        const getBridge = () => {
            return window.chrome?.webview?.hostObjects?.bridge;
        };

        const pickFolder = async () => {
            try {
                const bridge = getBridge();
                if (!bridge?.request) {
                    console.warn("Bridge module 'request' not found.");
                    return;
                }
                const path = await bridge.request.SelectFolder();
                if (path) {
                    targetFolderPath.value = path;
                }
            } catch (err) {
                console.error('Folder selection failed:', err);
            }
        };

        const loadHierarchy = async () => {
            status.value = 'LOADING';
            try {
                const data = await apiClient.getHierarchy();
                // Flatten: ProcessPlan -> BeolOption (skip BeolGroup for tree display)
                hierarchy.value = (data || []).map(pp => ({
                    ...pp,
                    expanded: false,
                    beol_options: (pp.beol_groups || []).flatMap(bg => 
                        (bg.beol_options || []).map(bo => ({ 
                            ...bo, 
                            expanded: false,
                            group_name: bg.group_name // Reference group name if needed
                        }))
                    )
                }));
            } catch (error) {
                console.error('Failed to load hierarchy:', error);
                status.value = 'ERROR';
            } finally {
                if (status.value !== 'ERROR') status.value = 'READY';
            }
        };

        const selectProduct = async (product, bo, pp) => {
            selectedProduct.value = product;
            selectedBO.value = bo;
            selectedPP.value = pp;
            selectedRequest.value = null;
            viewMode.value = 'list';
            await refreshRequests();
        };

        const refreshRequests = async () => {
            if (!selectedProduct.value) return;
            status.value = 'LOADING';
            try {
                const data = await apiClient.getRequestsByProduct(selectedProduct.value.id);
                requests.value = data;
            } catch (err) {
                console.error("Failed to fetch requests", err);
            } finally {
                status.value = 'READY';
            }
        };

        const selectRequest = async (request) => {
            selectedRequest.value = request;
            selectedRefs.value = [];
            viewMode.value = 'list';
            status.value = 'LOADING';
            try {
                const data = await apiClient.getRequestReferences(request.id);
                references.value = data;
            } catch (err) {
                console.error("Failed to fetch references", err);
            } finally {
                status.value = 'READY';
            }
        };

        const showDetail = async (refItem) => {
            status.value = 'LOADING';
            try {
                const detail = await apiClient.getPhotoKeyDetail(refItem.id);
                if (detail && detail.workbook_data) {
                    detailWorkbook.value = detail.workbook_data;
                    if (detailWorkbook.value.Worksheets && detailWorkbook.value.Worksheets.length > 0) {
                        activeSheet.value = detailWorkbook.value.Worksheets[0];
                    } else {
                        activeSheet.value = null;
                    }
                    viewMode.value = 'detail';
                } else {
                    alert('No workbook data available for this reference.');
                }
            } catch (error) {
                alert('Failed to load detail: ' + error.message);
            } finally {
                status.value = 'READY';
            }
        };

        const toggleRefSelection = (refItem) => {
            const index = selectedRefs.value.findIndex(r => r.id === refItem.id);
            if (index > -1) {
                selectedRefs.value.splice(index, 1);
            } else {
                selectedRefs.value.push(refItem);
            }
        };

        const ensureFullData = async (refs) => {
            const results = [];
            for (const refItem of refs) {
                let itemWithData = { ...refItem };
                if (!itemWithData.workbook_data) {
                    try {
                        // Use getRestoreData to fetch just the workbook_data object
                        const wbData = await apiClient.getRestoreData(refItem.id);
                        itemWithData.workbook_data = typeof wbData === 'string' ? JSON.parse(wbData) : wbData;
                    } catch (e) {
                        console.error(`Failed to fetch restore data for key ${refItem.id}`, e);
                    }
                } else if (typeof itemWithData.workbook_data === 'string') {
                    try { itemWithData.workbook_data = JSON.parse(itemWithData.workbook_data); } catch(e) {}
                }
                results.push(itemWithData);
            }
            return results;
        };

        const loadSelectedToExcel = () => downloadSelectedAsExcel(true);

        const downloadSelectedAsExcel = async (openAfterRestore) => {
            if (selectedRefs.value.length === 0) {
                alert('Select tables to process.');
                return;
            }
            
            if (!targetFolderPath.value) {
                await pickFolder();
                if (!targetFolderPath.value) return;
            }

            status.value = 'PROCESSING';
            try {
                const fullRefs = await ensureFullData(selectedRefs.value);
                const bridge = getBridge();
                if (!bridge?.request) throw new Error("Bridge 'request' module not available.");

                if (openAfterRestore) {
                    // Use RestoreToExcel for 'Load & Open' - Expects RestoreItem { WorkbookData, TargetPath }
                    const itemsToRestore = fullRefs.map(key => {
                        const pp = selectedPP.value?.design_rule || "UnknownPP";
                        const bo = selectedBO.value?.option_name || "UnknownBO";
                        const partId = selectedProduct.value?.partid || "UnknownPart";
                        const prodName = selectedProduct.value?.product_name || "";
                        const tableName = key.table_name || "UnknownTable";
                        const rev = key.rev_no;
                        const dateStr = key.update_date ? new Date(key.update_date).toISOString().split('T')[0].replace(/-/g, '') : "UnknownDate";

                        let targetDir = "";
                        if (folderStructure.value === 'nested') {
                            targetDir = `${targetFolderPath.value}\\RFGO\\${pp}\\${bo}\\${partId}`;
                        } else {
                            const flatName = `${pp}_${bo}_${partId}_${prodName}`.replace(/[\\\/:*?"<>|]/g, '_');
                            targetDir = `${targetFolderPath.value}\\RFGO\\${flatName}`;
                        }

                        const safeTableName = tableName.replace(/[\\\/:*?"<>|]/g, '_');
                        const fileName = `${pp}_${bo}_${partId}_${safeTableName}_Rev${rev}_${dateStr}.xlsx`;
                        
                        return {
                            WorkbookData: key.workbook_data,
                            TargetPath: `${targetDir}\\${fileName}`
                        };
                    });
                    await bridge.request.RestoreToExcel(JSON.stringify(itemsToRestore), targetFolderPath.value, true);
                } else {
                    // Use DownloadAsExcel for 'Download Only' - Expects List<PhotoKeyModel> { id, table_name, rev_no, workbook_data, filename }
                    await bridge.request.DownloadAsExcel(JSON.stringify(fullRefs), targetFolderPath.value);
                }
            } catch (err) {
                console.error("Operation failed", err);
                alert("Operation failed: " + err.message);
            } finally {
                status.value = 'READY';
            }
        };

        onMounted(loadHierarchy);

        return {
            hierarchy, requests, references,
            selectedProduct, selectedBO, selectedPP,
            selectedRequest, selectedRefs,
            status, viewMode, detailWorkbook, activeSheet, targetFolderPath, folderStructure,
            loadHierarchy, selectProduct, selectRequest, refreshRequests,
            toggleRefSelection, showDetail, pickFolder,
            loadSelectedToExcel, downloadSelectedAsExcel
        };
    }
});

app.mount('#app');
