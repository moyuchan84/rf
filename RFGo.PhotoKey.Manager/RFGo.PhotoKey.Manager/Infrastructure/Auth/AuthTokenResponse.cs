using System;
using System.Collections.Generic;

namespace RFGo.PhotoKey.Manager.Infrastructure.Auth
{
    public class AuthTokenResponse
    {
        public string LoginId { get; set; }
        public string DeptId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string DeptName { get; set; }
        public string JwtToken { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }
}
