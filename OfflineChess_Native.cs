using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Windows.Forms;

namespace OfflineChessApp
{
    static class Program
    {
        private static HttpListener _listener;
        private static string _baseDir;
        private static bool _isRunning = true;

        [STAThread]
        static void Main()
        {
            _baseDir = AppDomain.CurrentDomain.BaseDirectory;
            if (!File.Exists(Path.Combine(_baseDir, "index.html")))
            {
                // Fallback to parent directory if in a bin/ subfolder
                DirectoryInfo parentInfo = Directory.GetParent(_baseDir);
                string parent = parentInfo != null ? parentInfo.FullName : null;
                if (parent != null && File.Exists(Path.Combine(parent, "index.html")))
                {
                    _baseDir = parent;
                }
            }

            int port = GetFreePort();
            StartHttpServer(port);

            string url = string.Format("http://127.0.0.1:{0}/index.html", port);
            string edgePath = FindEdgePath();

            if (!string.IsNullOrEmpty(edgePath))
            {
                string tempProfile = Path.Combine(Path.GetTempPath(), "OfflineChess_" + Guid.NewGuid().ToString("N"));
                Directory.CreateDirectory(tempProfile);

                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = edgePath,
                    Arguments = string.Format("--app=\"{0}\" --window-size=1220,860 --user-data-dir=\"{1}\" --no-first-run --no-default-browser-check", url, tempProfile),
                    UseShellExecute = false
                };

                try
                {
                    using (Process proc = Process.Start(psi))
                    {
                        proc.WaitForExit();
                    }
                }
                finally
                {
                    try { Directory.Delete(tempProfile, true); } catch { }
                }
            }
            else
            {
                // Fallback to default browser
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
                // Keep running until user terminates or exits
                Thread.Sleep(3000);
            }

            _isRunning = false;
            try { _listener.Stop(); } catch { }
        }

        private static int GetFreePort()
        {
            TcpListener l = new TcpListener(IPAddress.Loopback, 0);
            l.Start();
            int port = ((IPEndPoint)l.LocalEndpoint).Port;
            l.Stop();
            return port;
        }

        private static void StartHttpServer(int port)
        {
            _listener = new HttpListener();
            _listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", port));
            _listener.Start();

            Thread t = new Thread(ServerWorker) { IsBackground = true };
            t.Start();
        }

        private static void ServerWorker()
        {
            while (_isRunning)
            {
                try
                {
                    HttpListenerContext ctx = _listener.GetContext();
                    ThreadPool.QueueUserWorkItem((state) => HandleRequest(ctx));
                }
                catch
                {
                    if (!_isRunning) break;
                }
            }
        }

        private static void HandleRequest(HttpListenerContext ctx)
        {
            try
            {
                string rawUrl = ctx.Request.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(rawUrl)) rawUrl = "index.html";

                string filePath = Path.Combine(_baseDir, rawUrl.Replace('/', Path.DirectorySeparatorChar));

                if (File.Exists(filePath))
                {
                    byte[] data = File.ReadAllBytes(filePath);
                    string ext = Path.GetExtension(filePath).ToLowerInvariant();

                    string contentType = "application/octet-stream";
                    if (ext == ".html" || ext == ".htm") contentType = "text/html; charset=utf-8";
                    else if (ext == ".css") contentType = "text/css; charset=utf-8";
                    else if (ext == ".js") contentType = "application/javascript; charset=utf-8";
                    else if (ext == ".svg") contentType = "image/svg+xml";
                    else if (ext == ".ico") contentType = "image/x-icon";
                    else if (ext == ".png") contentType = "image/png";
                    else if (ext == ".json") contentType = "application/json";

                    ctx.Response.ContentType = contentType;
                    ctx.Response.ContentLength64 = data.Length;
                    ctx.Response.StatusCode = 200;
                    ctx.Response.OutputStream.Write(data, 0, data.Length);
                }
                else
                {
                    ctx.Response.StatusCode = 404;
                }
            }
            catch { }
            finally
            {
                try { ctx.Response.OutputStream.Close(); } catch { }
            }
        }

        private static string FindEdgePath()
        {
            string[] paths = new string[]
            {
                Environment.ExpandEnvironmentVariables(@"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
                Environment.ExpandEnvironmentVariables(@"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
                Environment.ExpandEnvironmentVariables(@"%LocalAppData%\Microsoft\Edge\Application\msedge.exe")
            };

            foreach (string p in paths)
            {
                if (File.Exists(p)) return p;
            }
            return null;
        }
    }
}
