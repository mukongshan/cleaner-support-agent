import os
import requests
import webbrowser
from urllib.parse import unquote

# ==========================
# 🎯 配置区域
# ==========================
SERVER_URL = "https://box.nju.edu.cn"  # NJU Box 服务器地址

# 你的资料库级别 Token
REPO_TOKEN = "8142382146993d9f7fc328074f73b28ab644efea"

# 资料库的 UUID
REPO_ID = "9136e9de-f49e-45f6-9aff-9e3abe07a257"  # 请确认这是你的目标资料库 ID

FILE_PATH = "01-Tool Preparation.mp4"  # ✅ 请修改为你资料库中实际存在的文件路径

DOWNLOAD_FOLDER = "./downloads"  # 文件下载保存的本地目录（可选）

REPO_PASSWORD = None  # 如果资料库加密，请填写密码，如 "123456"

# ==========================
# 📌 支持在线查看的文件扩展名
# ==========================
VIEWABLE_EXTENSIONS = {
    # PDF
    '.pdf',
    # 图片
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
    # 视频
    '.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.webm', '.ts',
    # 音频
    '.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a',
}


# ==========================
# 🛠️ 工具函数
# ==========================

def get_file_download_link(repo_id, file_path, repo_password=None):
    url = f"{SERVER_URL}/api/v2.1/via-repo-token/download-link/"
    headers = {"Authorization": f"Bearer {REPO_TOKEN}"}
    params = {"repo_id": repo_id, "path": file_path}

    if repo_password:
        params["password"] = repo_password

    print(f"[INFO] 获取下载链接: {url}")
    print(f"[DEBUG] 参数: repo_id={repo_id}, path={file_path}, password={'***' if repo_password else '无'}")

    response = requests.get(url, headers=headers, params=params)
    print(f"[DEBUG] 状态码: {response.status_code}")
    print(f"[DEBUG] 原始响应: {response.text}")

    if response.status_code == 200:
        raw = response.text.strip()
        download_url = raw.strip('"').strip("'")
        if download_url.startswith(('http://', 'https://')):
            print(f"[✅] 获取下载链接成功: {download_url}")
            return download_url
        else:
            print(f"[❌] 响应不是有效链接: {download_url}")
            return None
    else:
        print(f"[❌] 获取下载链接失败，状态码: {response.status_code}, 错误: {response.text}")
        return None

from urllib.parse import quote

def get_seafile_web_preview_url(repo_id, file_path):
    """
    构造 Seafile Web 前端的文件访问链接，通常可在线预览（如果文件类型支持）
    :param repo_id: 资料库 ID，如 '1234567890abcdef'
    :param file_path: 文件在库中的路径，如 '/test.pdf'
    :return: 完整的 Web 预览链接，如 https://cloud.seafile.com/lib/.../file?p=...
    """
    encoded_path = quote(file_path)  # 对路径进行 URL 编码，比如 /test.pdf → %2Ftest.pdf
    web_url = f"{SERVER_URL}/lib/{repo_id}/file/{encoded_path}"
    return web_url

def is_viewable_file(file_path):
    _, ext = os.path.splitext(file_path.lower())
    return ext in VIEWABLE_EXTENSIONS


def open_file_online(download_url, file_name=None):
    if not download_url.startswith(('http://', 'https://')):
        print(f"[❌] 无效的下载链接: {download_url}")
        return
    print(f"[ℹ️] 尝试在浏览器中在线查看文件: {download_url}")
    try:
        webbrowser.open(download_url)
        print(f"[✅] 已在浏览器中打开文件，请查看。")
    except Exception as e:
        print(f"[❌] 打开浏览器失败: {e}")


def download_file(download_url, save_path=None):
    if not download_url.startswith(('http://', 'https://')):
        print(f"[❌] 无效的下载链接: {download_url}")
        return False

    try:
        response = requests.get(download_url, stream=True)
        if response.status_code == 200:
            if save_path is None:
                save_path = os.path.join(DOWNLOAD_FOLDER, os.path.basename(unquote(download_url.split('/')[-1])))

            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"[✅] 文件已下载到: {save_path}")
            return True
        else:
            print(f"[❌] 下载失败，状态码: {response.status_code}, 错误: {response.text}")
            return False
    except Exception as e:
        print(f"[❌] 下载异常: {e}")
        return False


# ==========================
# 🧠 智能处理：查看 or 下载
# ==========================
def smart_handle_file(repo_id, file_path, repo_password=None):
    # 1. 判断是否可在线查看
    file_name = os.path.basename(file_path)
    viewable = is_viewable_file(file_path)

    print(f"[ℹ️] 文件: {file_name}")
    print(f"[ℹ️] 路径: {file_path}")
    print(f"[ℹ️] 是否可在线预览: {'✅ 是' if viewable else '❌ 否'}")

    if viewable:
        # 构造 Seafile Web 在线预览链接
        preview_url = get_seafile_web_preview_url(repo_id, file_path)
        print(f"[ℹ️] 尝试在线预览: {preview_url}")
        try:
            webbrowser.open(preview_url)
            print(f"[✅] 已尝试在浏览器中打开预览链接。如果已登录 Seafile，应该会直接预览。")
        except Exception as e:
            print(f"[❌] 打开浏览器失败: {e}")
    else:
        # 不可预览，使用下载链接
        download_url = get_file_download_link(repo_id, file_path, repo_password)
        if download_url:
            print(f"[ℹ️] 该文件类型不支持在线预览，开始下载: {download_url}")
            download_file(download_url)
        else:
            print(f"[❌] 无法获取下载链接，无法下载文件。")


# ==========================
# ▶️ 主程序
# ==========================
if __name__ == "__main__":
    print("🚀 开始智能处理文件：在线查看 or 下载")
    print("=" * 50)

    smart_handle_file(REPO_ID, FILE_PATH, repo_password=REPO_PASSWORD)