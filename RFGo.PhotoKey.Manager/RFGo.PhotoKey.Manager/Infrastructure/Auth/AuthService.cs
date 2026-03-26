using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Configuration;
using Newtonsoft.Json;

namespace RFGo.PhotoKey.Manager.Infrastructure.Auth
{
    public interface ISsoAdapter
    {
        Task<SsoProfile> GetProfileAsync();
    }

    public class SsoProfile
    {
        public string epId { get; set; }
        public string userId { get; set; }
        public string fullName { get; set; }
        public string deptName { get; set; }
        public string email { get; set; }
    }

    public class DevSsoAdapter : ISsoAdapter
    {
        public Task<SsoProfile> GetProfileAsync()
        {
            // 로컬 개발용 가짜 데이터
            return Task.FromResult(new SsoProfile
            {
                epId = "11112222",
                userId = "admin_user",
                fullName = "Admin Manager",
                deptName = "Digital Transformation Team",
                email = "admin@samsung.com"
            });
        }
    }

    public class InternalSsoAdapter : ISsoAdapter
    {
        public async Task<SsoProfile> GetProfileAsync()
        {
            // 실제 사내 SSO 호출 로직 (향후 구현)
            throw new NotImplementedException("Internal SSO logic not implemented yet.");
        }
    }

    public class AuthService
    {
        private static AuthService _instance;
        public static AuthService Instance => _instance ?? (_instance = new AuthService());

        private readonly ISsoAdapter _ssoAdapter;
        private readonly string _baseUrl;

        public AuthTokenResponse CurrentUser { get; private set; }
        public bool IsAuthenticated => CurrentUser != null;

        private AuthService() 
        {
            _baseUrl = ConfigurationManager.AppSettings["BaseUrl"] ?? "http://localhost:8080/api/v1";
#if DEBUG
            _ssoAdapter = new DevSsoAdapter();
#else
            _ssoAdapter = new InternalSsoAdapter();
#endif
        }

        public async Task<bool> LoginAsync()
        {
            try
            {
                // 1. SSO 프로필 획득
                var profile = await _ssoAdapter.GetProfileAsync();
                string ssoToken = "VSTO_SSO_TOKEN_" + DateTime.Now.Ticks;

                // 2. FastAPI 백엔드에 프로필 전달하여 인증 및 JWT 발급
                using (var client = new HttpClient())
                {
                    var authRequest = new 
                    { 
                        ssoToken = ssoToken,
                        profile = profile
                    };

                    var content = new StringContent(
                        JsonConvert.SerializeObject(authRequest), 
                        Encoding.UTF8, 
                        "application/json"
                    );
                    
                    var response = await client.PostAsync($"{_baseUrl}/auth/authenticate", content);
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();
                        CurrentUser = JsonConvert.DeserializeObject<AuthTokenResponse>(json);
                        return true;
                    }
                    else
                    {
                        var error = await response.Content.ReadAsStringAsync();
                        System.Windows.Forms.MessageBox.Show("Backend Auth Failed: " + error);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Windows.Forms.MessageBox.Show("Auth Service Error: " + ex.Message);
            }
            return false;
        }

        public string GetBaseUrl() => _baseUrl;

        public bool HasRole(string role) => CurrentUser?.Roles?.Contains(role) ?? false;
        
        public bool IsAdminOrInno() => HasRole("ADMIN") || HasRole("INNO");
    }
}
