namespace RFGo.PhotoKey.Manager.Domain.Models
{
    public class CellStyleInfo
    {
        public string FontName { get; set; }
        public double FontSize { get; set; }
        public bool FontBold { get; set; }
        public bool FontItalic { get; set; }
        public object FontColor { get; set; }
        public object FillColor { get; set; }
        public int FillPattern { get; set; }
        public int HorizontalAlignment { get; set; }
        public int VerticalAlignment { get; set; }
        public string NumberFormat { get; set; }
        public BorderInfo BorderTop { get; set; }
        public BorderInfo BorderBottom { get; set; }
        public BorderInfo BorderLeft { get; set; }
        public BorderInfo BorderRight { get; set; }
    }

    public class BorderInfo
    {
        public int LineStyle { get; set; }
        public int Weight { get; set; }
        public object Color { get; set; }
    }
}
