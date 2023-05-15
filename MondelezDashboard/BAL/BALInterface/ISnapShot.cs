using Entites;
using System.Collections.Generic;
using Aspose.Slides;

namespace BAL
{
    public interface ISnapShot
    {
        int GetUserId(string EmailId);
        List<object> GetChartOutput(SnapshotRequest request);
        string ExportPPTExcel(SnapshotRequest request);
        Presentation StoryBoardPPT(SnapshotRequest request, Presentation pres);
    }
}
