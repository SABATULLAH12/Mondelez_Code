using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entites
{
    public static class CustomError
    {
        public static CustomErrorMessage SetError(Exception ex)
        {
            CustomErrorMessage customErrorMessage = new CustomErrorMessage();
            customErrorMessage.IsError = true;
            string Message = "Something went wrong. Please refresh the screen and try. If it is occuring again, please contact support team.";
            if(ex.Source == ".Net SqlClient Data Provider")
            {
                if(ex.Message.Contains("Could not find"))//Command timeout 
                {
                    Message = "DB Resources are missing. Please contact support team.";
                }
                else if(ex.Message.Contains("Execution Timeout Expired"))
                {
                    Message = "Failed to complete Database operation in given time.Please contact support team.";
                }
                else
                {
                    Message = "DB Error";
                }
            }
            customErrorMessage.Message = Message;

            return customErrorMessage;
        }
    }
}
