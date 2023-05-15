using Entites;
using System.Collections.Generic;

namespace BAL
{
    public interface IStoryBoard 
    {
        int GetUserId(string EmailId);
        object StoriesToSave(StoryBoardRequest request);
        object SavedStories(StoryBoardRequest request);
        bool AddSlide(StoryBoardRequest request);
        bool AddStory(StoryBoardRequest request);
        bool DeleteStory(int storyId);
        bool DeleteSlide(string slideIds);
        bool EditStoryName(int storyId, string storyName,string userId);
        List<StorySlide> GetStorySlides(int storyId);
        object GetUsers(int storyId,string userId);
        bool ShareStory(string storyId, string userIdsToShare,string curUserID);
        object SharedStories(string userId, bool isSharedWithMe);
        string PrepareStoryBoardPPT(List<StorySlide> Slides,string userName);
        bool saveASNewStory(int? storyID, string storyName, string userId);
        bool UpdateSlides(List<StorySlide> slides);
        StoryLock GetLockStatus(string StoryID);
        bool SetLock(StoryLock data);
    }
}
