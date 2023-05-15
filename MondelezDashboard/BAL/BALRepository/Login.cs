using BAL.BALInterface;
using DAL;
using DAL.DALInterface;
using Entites;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BAL.BALRepository
{
    public class Login:ILogin
    {
        internal readonly IUnitOfWork _unitOfWork;

        #region Constructor
        public Login(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        #endregion

        public LoginResponse CheckUser(LoginRequest request)
        {
            return _unitOfWork.GetRepository<ILoginRepository>().CheckUser(request);
        }

        public AuthUserDetails GetUserDetails(string UserName)
        {
            return _unitOfWork.GetRepository<ILoginRepository>().GetUserDetails(UserName);
        }
        public int GetUserId(AuthUserDetails userDetails)
        {
            return _unitOfWork.GetRepository<ILoginRepository>().GetUserId(userDetails);
        }
    }
}
