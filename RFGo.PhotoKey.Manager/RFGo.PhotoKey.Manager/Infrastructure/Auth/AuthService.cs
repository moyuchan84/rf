using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace RFGo.PhotoKey.Manager.Infrastructure.Auth
{
    public class AuthService
    {
        private static AuthService _instance;
        public static AuthService Instance => _instance ?? (_instance = new AuthService());

        public AuthTokenResponse CurrentUser { get; private set; }
        public bool IsAuthenticated => CurrentUser != null;

        private AuthService() { }

        public async Task<bool> LoginAsync()
        {
            try
            {
                // 1. SSO 로그인 시도 (회사 제공 로직 예정)
                string mockSsoToken = "MOCK_SSO_TOKEN_" + DateTime.Now.Ticks;

                // 2. 백엔드 authenticate 호출
                using (var client = new HttpClient())
                {
                    string baseUrl = "";
#if DEBUG
                    baseUrl = "http://localhost:8080/api/v1";
#else
                    baseUrl = "https://api.your-production-server.com/api/v1"; 
#endif
                    var content = new StringContent(
                        JsonConvert.SerializeObject(new { ssoToken = mockSsoToken }), 
                        Encoding.UTF8, 
                        "application/json"
                    );
                    
                    var response = await client.PostAsync($"{baseUrl}/auth/authenticate", content);
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();
                        CurrentUser = JsonConvert.DeserializeObject<AuthTokenResponse>(json);
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Windows.Forms.MessageBox.Show("Auth Service Error: " + ex.Message);
            }
            return false;
        }

        public bool HasRole(string role) => CurrentUser?.Roles?.Contains(role) ?? false;
        
        public bool IsAdminOrInno() => HasRole("ADMIN") || HasRole("INNO");
    }
}
