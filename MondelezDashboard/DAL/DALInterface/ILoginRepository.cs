using Entites;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.DALInterface
{
    public interface ILoginRepository
    {
        LoginResponse CheckUser(LoginRequest request);

        AuthUserDetails GetUserDetails(string UserName);
        
        int GetUserId(AuthUserDetails userDetails);
        
    }
}
