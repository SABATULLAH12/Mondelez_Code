using System.Data;
using Entites;

namespace DAL
{
    public interface ICrossTabRepository
    {
        int GetUserId(string EmailId);
        DataSet GetData(CrossTabViewRequest request);
    }
}
