const { createApp, ref, reactive, watch } = Vue;

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

        const contextMenu = reactive({
            visible: false,
            x: 0,
            y: 0
        });

        // Watch folderPath to auto-fill hierarchy
        watch(folderPath, (newPath) => {
            if (!newPath) return;
            const folderName = newPath.split(/[\\/]/).pop();
            const parts = folderName.split('_');
            if (parts.length >= 4) {
                hierarchy.processPlan = parts[0];
                hierarchy.beolOption = parts[1];
                hierarchy.partId = parts[2];
                hierarchy.productName = parts.slice(3).join('_');
            } else {
                hierarchy.processPlan = '';
                hierarchy.beolOption = '';
                hierarchy.partId = '';
                hierarchy.productName = '';
            }
        });

        const openFolderDialog = async () => {
            try {
                // Access via modular bridge
                const path = await window.chrome.webview.hostObjects.bridge.loader.SelectFolder();
                if (path) {
                    folderPath.value = path;
                    await scanFiles();
                }
            } catch (err) {
                console.error('Folder dialog failed:', err);
            }
        };

        const scanFiles = async () => {
            if (!folderPath.value) return;
            status.value = 'SCANNING';
            try {
                const result = await window.chrome.webview.hostObjects.bridge.loader.GetFiles(folderPath.value);
                if (result.startsWith('Error')) {
                    status.value = 'ERROR';
                } else {
                    files.value = JSON.parse(result);
                    selectedFiles.value = [];
                    status.value = 'READY';
                }
            } catch (err) {
                status.value = 'ERROR';
            }
        };

        const parseAndPreview = async () => {
            if (selectedFiles.value.length === 0) return;
            
            status.value = 'PARSING';
            const results = [];
            const total = selectedFiles.value.length;
            
            try {
                for (let i = 0; i < total; i++) {
                    const file = selectedFiles.value[i];
                    parsingProgress.value = `(${i + 1}/${total}) ${file.FileName}`;
                    
                    const result = await window.chrome.webview.hostObjects.bridge.loader.ParseFile(file.FullPath);
                    if (!result.startsWith('Error')) {
                        results.push(JSON.parse(result));
                    }
                }
                
                if (results.length > 0) {
                    // Call C# to open the new Popup window
                    await window.chrome.webview.hostObjects.bridge.loader.ShowPreview(
                        JSON.stringify(results),
                        JSON.stringify(hierarchy)
                    );
                    status.value = 'READY';
                    parsingProgress.value = '';
                } else {
                    status.value = 'ERROR';
                    alert('파일 파싱에 실패했습니다.');
                }
            } catch (err) {
                status.value = 'ERROR';
                console.error('Parsing failed:', err);
            }
        };

        const showContextMenu = (e) => {
            contextMenu.x = e.clientX;
            contextMenu.y = e.clientY;
            contextMenu.visible = true;
        };

        const closeContextMenu = () => {
            contextMenu.visible = false;
        };

        const selectAll = () => {
            selectedFiles.value = [...files.value];
            closeContextMenu();
        };

        const deselectAll = () => {
            selectedFiles.value = [];
            closeContextMenu();
        };

        return { 
            folderPath, 
            files, 
            selectedFiles, 
            status, 
            parsingProgress,
            hierarchy,
            contextMenu,
            openFolderDialog,
            scanFiles, 
            parseAndPreview,
            showContextMenu,
            closeContextMenu,
            selectAll,
            deselectAll
        };
    }
}).mount('#app');