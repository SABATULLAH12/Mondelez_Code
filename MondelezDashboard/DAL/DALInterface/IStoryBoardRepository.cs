using System.Data;
using Entites;

namespace DAL
{
    public interface IStoryBoardRepository
    {
        int GetUserId(string EmailId);
        DataSet StoriesToSave(StoryBoardRequest request);
        DataSet SavedStories(StoryBoardRequest request);
        DataSet AddSlide(StoryBoardRequest request);
        DataSet AddStory(StoryBoardRequest request);
        DataSet DeleteStory(int storyId);
        DataSet DeleteSlide(string slideIds);
        DataSet EditStoryName(int storyId, string storyName,string userId);
        DataSet GetStorySlides(int storyId);
        DataSet GetUsers(int storyId);
        bool ShareStory(string storyId, string userIdsToShare, string curUserID);
        DataSet SharedStories(string userId, bool isSharedWithMe);
        DataSet saveASNewStory(int? storyID, string storyName, string userId);
        bool UpdateSlides(StorySlide slide);
        DataSet GetLockStatus(string StoryID);
        bool SetLock(StoryLock data);
    }
}
