using System;
using System.Text;
using MSExcel = Microsoft.Office.Interop.Excel;
using System.Web.Script.Serialization;
using RFGo.PhotoKey.Manager.Application.Interfaces;
using RFGo.PhotoKey.Manager.Domain.Models;

namespace RFGo.PhotoKey.Manager.Infrastructure.Excel
{
    public class ExcelStyleSerializer : IExcelStyleService
    {
        private static readonly JavaScriptSerializer Serializer = new JavaScriptSerializer();

        public string SerializeStyle(MSExcel.Range range)
        {
            if (range == null) return string.Empty;

            try
            {
                var info = new CellStyleInfo
                {
                    FontName = range.Font.Name?.ToString(),
                    FontSize = (double)range.Font.Size,
                    FontBold = (bool)range.Font.Bold,
                    FontItalic = (bool)range.Font.Italic,
                    FontColor = range.Font.Color,
                    FillColor = range.Interior.Color,
                    FillPattern = (int)range.Interior.Pattern,
                    HorizontalAlignment = (int)range.HorizontalAlignment,
                    VerticalAlignment = (int)range.VerticalAlignment,
                    NumberFormat = range.NumberFormat?.ToString(),
                    BorderTop = GetBorderInfo(range.Borders[MSExcel.XlBordersIndex.xlEdgeTop]),
                    BorderBottom = GetBorderInfo(range.Borders[MSExcel.XlBordersIndex.xlEdgeBottom]),
                    BorderLeft = GetBorderInfo(range.Borders[MSExcel.XlBordersIndex.xlEdgeLeft]),
                    BorderRight = GetBorderInfo(range.Borders[MSExcel.XlBordersIndex.xlEdgeRight])
                };

                string json = Serializer.Serialize(info);
                return Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
            }
            catch { return string.Empty; }
        }

        public void ApplyStyle(MSExcel.Range range, string styleBundle)
        {
            if (range == null || string.IsNullOrEmpty(styleBundle)) return;

            try
            {
                byte[] bytes = Convert.FromBase64String(styleBundle);
                var info = Serializer.Deserialize<CellStyleInfo>(Encoding.UTF8.GetString(bytes));
                if (info == null) return;

                if (!string.IsNullOrEmpty(info.FontName)) range.Font.Name = info.FontName;
                range.Font.Size = info.FontSize;
                range.Font.Bold = info.FontBold;
                range.Font.Italic = info.FontItalic;
                range.Font.Color = info.FontColor;
                range.Interior.Color = info.FillColor;
                range.Interior.Pattern = (MSExcel.XlPattern)info.FillPattern;
                range.HorizontalAlignment = (MSExcel.XlHAlign)info.HorizontalAlignment;
                range.VerticalAlignment = (MSExcel.XlVAlign)info.VerticalAlignment;
                if (!string.IsNullOrEmpty(info.NumberFormat)) range.NumberFormat = info.NumberFormat;

                ApplyBorderInfo(range.Borders[MSExcel.XlBordersIndex.xlEdgeTop], info.BorderTop);
                ApplyBorderInfo(range.Borders[MSExcel.XlBordersIndex.xlEdgeBottom], info.BorderBottom);
                ApplyBorderInfo(range.Borders[MSExcel.XlBordersIndex.xlEdgeLeft], info.BorderLeft);
                ApplyBorderInfo(range.Borders[MSExcel.XlBordersIndex.xlEdgeRight], info.BorderRight);
            }
            catch { }
        }

        private BorderInfo GetBorderInfo(MSExcel.Border border)
        {
            if (border == null) return null;
            return new BorderInfo
            {
                LineStyle = (int)border.LineStyle,
                Weight = (int)border.Weight,
                Color = border.Color
            };
        }

        private void ApplyBorderInfo(MSExcel.Border border, BorderInfo info)
        {
            if (border == null || info == null) return;
            try
            {
                border.LineStyle = (MSExcel.XlLineStyle)info.LineStyle;
                if (info.LineStyle != (int)MSExcel.XlLineStyle.xlLineStyleNone)
                {
                    border.Weight = (MSExcel.XlBorderWeight)info.Weight;
                    border.Color = info.Color;
                }
            }
            catch { }
        }
    }
}
