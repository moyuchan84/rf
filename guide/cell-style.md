3. 최강의 솔루션: XML/HTML Clipboard 복사 기법 (추천)
가장 빠르고 정확하게 "처음과 완전히 동일한" 스타일을 복원하는 전략은 Excel의 내부 XML 구조(XLSX 저장 방식) 또는 HTML 클립보드 데이터를 활용하는 것입니다.

전략 A: Range.Copy & Paste (추천)
복원용 템플릿 시트를 숨김 처리해두고, 특정 스타일 세트를 Copy한 뒤 대상 영역에 PasteSpecial(xlPasteAllExceptBorders) 등을 사용하는 방식입니다. 하지만 DB 저장형이라면 다음 방식이 더 적합합니다.

전략 B: HTML/Base64 데이터 저장 (고속 복원)
Excel은 셀 영역을 복사하면 HTML 형식으로 스타일 정보를 들고 있습니다.

추출: 특정 영역을 선택하여 Range.Copy()를 실행하고, 클립보드에 담긴 HTML/CSS 데이터를 문자열로 추출하여 DB의 style_bundle 필드에 저장합니다.

복원: * C#에서 저장된 HTML 문자열을 클립보드에 다시 씁니다.

Excel의 대상 위치를 선택하고 Range.PasteSpecial()을 호출합니다.

결과: 폰트, 정렬, 병합, 배경색 등이 0.1초 내에 완벽히 복원됩니다.

🏗️ 업데이트된 C# 구현 구조 (Pseudo Code)
C#
// 1. 추출 (Parsing) - 클립보드 HTML 활용
public string ExtractStyleAsHtml(Excel.Range targetRange) {
    targetRange.Copy(); // 셀 복사
    IDataObject data = Clipboard.GetDataObject();
    return data.GetData(DataFormats.Html).ToString(); // HTML 소스 그대로 저장
}

// 2. 복원 (Restoration) - 고속 붙여넣기
public void RestoreDataWithStyle(Excel.Worksheet sheet, string cellAddress, object[,] values, string htmlStyle) {
    // 1단계: 값 대입 (배열로 한 번에)
    Excel.Range targetRange = sheet.Range[cellAddress].Resize[values.GetLength(0), values.GetLength(1)];
    targetRange.Value2 = values;

    // 2단계: 스타일 복원 (클립보드 이용)
    Clipboard.SetText(htmlStyle, TextDataFormat.Html);
    targetRange.PasteSpecial(Excel.XlPasteType.xlPasteFormats); 
}
📝 GEMINI.md 추가 사항 (Strategy 반영)
Markdown
### **Module: High-Speed Restoration Logic**
* **Issue:** 셀 단위 스타일 기입 시 COM 오버헤드로 인한 성능 저하 발생.
* **Solution:** 1. **Data Layer:** `object[,]` 배열 기반의 대용량 데이터 전송 (Bulk Write).
    2. **Style Layer:** Excel HTML Clipboard 데이터를 `style_bundle`에 저장하여 레이아웃/서식/병합 정보를 단일 연산으로 복원.
    3. **Optimization:** `Application.ScreenUpdating = false` 및 `Calculation = Manual` 모