# 이훈의 블로그

Astro의 블로그 템플릿으로 만든 정적 사이트입니다.

## 글 작성과 미리 보기

Node.js 24와 npm을 사용합니다. nvm을 사용 중이면 이 폴더에서 `nvm use`를 실행하세요.

```sh
npm ci
npm run dev
```

`src/content/blog/`에 Markdown(`.md`) 또는 MDX(`.mdx`) 파일을 추가하면 글 목록과 RSS에 나타납니다. 파일 이름이 글 주소에 사용됩니다. [예시 글](src/content/blog/first-post.md)의 `title`, `description`, `pubDate`를 참고하세요. 글 대표 이미지(`heroImage`)는 선택입니다. 빌드 결과를 보려면 `npm run build` 후 `npm run preview`를 실행하세요.

## GitHub Pages 배포

[저장소의 Settings → Pages](https://github.com/artilla/ProjectLeehun/settings/pages)에서 Source를 **GitHub Actions**로 설정합니다. `main`에 푸시하면 [배포 워크플로](.github/workflows/pages.yml)가 실행됩니다. 기본 주소는 [artilla.github.io/ProjectLeehun/](https://artilla.github.io/ProjectLeehun/)입니다.

## www.leehun.com 연결

1. **DNS를 먼저 복구합니다.** `leehun.com`의 등록기관은 가비아이고, 현재 위임된 네임서버는 `ns03.domaincontrol.com`, `ns04.domaincontrol.com`입니다. 이 서버에서 도메인 DNS 영역을 복구하거나, 기존 웹·메일 레코드를 새 DNS 서비스에 옮긴 뒤 가비아에서 해당 서비스의 네임서버로 변경합니다. 가비아 DNS를 선택하면 [네임서버 변경 안내](https://customer.gabia.com/faq/detail/286/26000)와 [DNS 레코드 설정 안내](https://customer.gabia.com/faq/detail/287/1201)를 참고하세요. 활성 네임서버에 입력한 레코드만 적용됩니다.
2. [artilla 계정의 Pages 설정](https://github.com/settings/pages)에서 `leehun.com`을 추가하고, GitHub가 표시하는 TXT 레코드로 [도메인 소유권을 확인](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)합니다.
3. [저장소의 Settings → Pages](https://github.com/artilla/ProjectLeehun/settings/pages)에서 **Custom domain**을 `www.leehun.com`으로 저장합니다.
4. 활성 DNS 서비스에서 `www`의 CNAME이 `artilla.github.io.`를 가리키게 합니다. 기존 `www` A·AAAA·CNAME 레코드가 있다면 충돌 여부를 확인하세요. CNAME 값에는 `https://`나 `/ProjectLeehun/`을 넣지 않습니다. [GitHub 공식 연결 안내](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
5. 저장소 Pages 설정에서 DNS 검사 통과와 인증서 발급을 확인한 뒤 **Enforce HTTPS**를 켭니다. [배포 워크플로](https://github.com/artilla/ProjectLeehun/actions/workflows/pages.yml)에서 **Run workflow**를 눌러 다시 배포하세요. 빌드는 Pages의 현재 도메인과 경로를 가져오므로 Astro 설정을 따로 고칠 필요가 없습니다.

```sh
dig leehun.com SOA
dig www.leehun.com CNAME +short
curl -I https://www.leehun.com/
```
