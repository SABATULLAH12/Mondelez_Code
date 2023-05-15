using Entites;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BAL.BALInterface
{
    public interface ILogin
    {
        LoginResponse CheckUser(LoginRequest request);
        AuthUserDetails GetUserDetails(string userName);
        int GetUserId(AuthUserDetails UserDetails);
    }
}
