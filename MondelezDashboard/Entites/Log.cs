using System;
using AQLogger;

namespace Entites
{
    public class Log
    {
        public static void LogProc(string procName, object[] param)
        {
            var p = string.Join("','", param);
            Logger.GetInstance().Debug(procName + " '" + p + "'");
        }

        public static void LogMessage(string messageText)
        {
            Logger.GetInstance().Debug(messageText);
        }

        public static void LogException(Exception ex)
        {
            Logger.GetInstance().Error(ex);
        }
    }
}
