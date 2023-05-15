using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entites
{
    public class StoryBoardRequest
    {
        public string ModuleId { get; set; }
        public string UserId { get; set; }
        public int SlideID { get; set; }
        public int? StoryID { get; set; }
        public string StoryName { get; set; }
        public string SlideName { get; set; }
        public string Selection { get; set; }
        public string CreUserId { get; set; }
        public string CreUser { get; set; }
        public DateTime CreDate { get; set; }
        public string ChgUser { get; set; }
        public DateTime ChgDate { get; set; }
        public string AddtionalInfo { get; set; }
        public string UserIdsToShare { get; set; }
        public bool isSharedWithMe { get; set; }
        public string SelectedSlides { get; set; }
        public int OrderBy { get; set; }
        public string base64 { get; set; }
    }
    public class StoryDetail
    {
        public int StoryID { get; set; }
        public string StoryName { get; set; }
        public bool IsLocked { get; set; }
        public bool IsShared { get; set; }
        public DateTime LockedDate { get; set; }
        public string LockedByUserName { get; set; }
        public string CreUserId { get; set; }
        public string CurUserId { get; set; }
        public string CreUser { get; set; }
        public DateTime CreDate { get; set; }
        public string ChgUser { get; set; }
        public DateTime ChgDate { get; set; }
        public int OrderBy { get; set; }
        public ICollection<StorySlide> Slides { get; set; }
        public ICollection<StoryShared> SharedTo { get; set; }
        public string ModuleName { get; set; }
    }
    public class StorySlide
    {
        public int SlideID { get; set; }
        public int StoryID { get; set; }
        public string StoryName { get; set; }
        public int ModuleId { get; set; }
        public string SelectionJSON { get; set; }
        public string CreUser { get; set; }
        public string CreUserId { get; set; }
        public DateTime CreDate { get; set; }
        public string SlidePath { get; set; }
        public string ChgUser { get; set; }
        public DateTime ChgDate { get; set; }
        public string AddtionalInfo { get; set; }
        public string base64 { get; set; }
    }
    public class StoryShared
    {
        public int SharedID { get; set; }
        public int StoryID { get; set; }
        public StoryDetail Story { get; set; }
        public string SharedBy { get; set; }
        public string SharedTo { get; set; }
        public DateTime SharedDate { get; set; }
    }
    public class StoryBoardDeepDiveParms
    {
        public DeepdiveViewRequest SlideParameters { get; set; }
    }
    public class StoryBoardSnapShotParms
    {
        public SnapshotRequest SlideParameters { get; set; }
    }
    public class StoryLock
    {
        public string StoryID { get; set; }
        public bool IsLocked { get; set; }
        public string LockedBy { get; set; }
    }
}

