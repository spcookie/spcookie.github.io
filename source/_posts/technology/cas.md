---
title: CAS单点登录原理
categories: [ 技术积累 ]
tags: [ 认证, SSO ]
author: Spcookie
group: default
comments: true
readmore: false
references:
  - title: CAS单点登录原理解析 - 你明哥 - 博客园
    url: https://www.cnblogs.com/lihuidu/p/6495247.html
  - title: 一篇文章彻底弄懂CAS实现SSO单点登录原理 - Hi，王松柏 - 博客园
    url: https://www.cnblogs.com/wangsongbai/p/10299655.html
plugins:
  - indent
date: 2024/7/29
updated: 2024/7/29
---

CAS（ Central Authentication Service ）是Yale大学发起的一个企业级的、开源的项目，旨在为Web应用系统提供一种可靠的单点登录解决方法（属于Web SSO）。

<!-- more -->

## 统一认证中心方案原理

### 结构体系

从结构体系看，CAS包括两部分：CAS Server和CAS Client。

#### CAS Server

CAS Server负责完成对用户的认证工作, 需要独立部署, CAS Server会处理用户名/密码等凭证(Credentials) 。

#### CAS Client

负责处理对客户端受保护资源的访问请求，需要对请求方进行身份认证时，重定向到CAS Server进行认证。CAS Client与受保护的客户端应用部署在一起，以Filter方式保护受保护的资源。

### 认证流程

用户第一次访问app1资源

![cas-app1](https://spcookie.oss-cn-hangzhou.aliyuncs.com/cas-app1-2024-07-29.jpg)

1. 用户访问app1.example.com，经过第一个过滤器（cas提供AuthenticationFilter）。
    - 过滤器全称：org.jasig.cas.client.authentication.AuthenticationFilter
    - 主要作用：判断是否登录，如果没有登录则重定向到认证中心。
2. app1.example.com发现用户没有登录，则返回浏览器重定向地址并且通过get的方式添加参数service，该参数目的是登录成功之后会要重定向回来。
3. 浏览器接收到重定向之后发起重定向，请求cas.example.com。
4. 认证中心cas.example.com接收到登录请求，返回登陆页面。
5. 用户在cas.example.com的login页面输入用户名密码，提交。
6. 服务器接收到用户名密码，则验证是否有效，验证逻辑可以使用cas-server提供现成的，也可以自己实现。当cas.example.com即csa-server认证通过之后，会返回给浏览器302，重定向的地址就是service参数对应的值。后边并通过get的方式挟带了一个ticket令牌，这个ticket就是ST。同时会在Cookie中设置一个CASTGC，该cookie是网站cas.example.com的cookie，只有访问这个网站才会携带这个cookie过去。
7. 浏览器从cas.example.com哪里拿到ticket之后，就根据指示重定向到app1.example.com。
8. app1.example.com在过滤器中会取到ticket的值，然后通过http方式调用cas.example.com验证该ticket是否是有效的。
9.  app1.example.com接收到cas-server的返回，知道了用户合法。
10. 创建对应的SESSION，返回Cookie值SESSIONID。
11. 展示相关资源到用户浏览器上。

> Cookie中的CASTGC：当下次访问cas.example.com时，浏览器将Cookie中的TGC携带到服务器，服务器根据这个TGC，查找与之对应的TGT。从而判断用户是否登录过了，是否需要展示登录页面。
> - TGT：Ticket Granted Ticket（大令牌，可以签发ST）
> - TGC：Ticket Granted Cookie（Cookie中CASTGC的值），存在Cookie中，根据他可以找到TGT。
> - ST：Service Ticket （小令牌），是TGT生成的，默认是用一次就生效了。ticket值。

用户第二次访问app1资源

![cas-app1-2](https://spcookie.oss-cn-hangzhou.aliyuncs.com/cas-app1-2-2024-07-29.jpg)

1. 用户发起请求，访问app1.example.com。会经过cas-client，也就是过滤器，因为第一次访问成功之后app1.example.com中会在session中记录用户信息，因此这里直接就通过了，不用验证了。
2. 用户通过权限验证，浏览器返回正常资源。
用户第一次访问app2资源
1. 用户请求app2.example.com，发现第一次访问，于是给他一个重定向的地址，让他去找认证中心（CAS server）登录。
2. app2.example.com发现用户没有登录（没有Cookie: SESSIONID），则返回浏览器重定向地址并且通过get的方式添加参数service，该参数目的是登录成功之后会要重定向回来。
3. 浏览器发起重定向，因为之前访问过一次了，因此这次会携带上次返回的Cookie：TGC到认证中心。
4. 认证中心收到请求，发现TGC对应了一个TGT，于是用TGT签发一个ST(ticket)，并且返回给浏览器，让他重定向到app2.example.com。
5. 浏览器根据返回的网址（app2.example.com?ticket=ST-7-GfpdKd.....）发起重定向。
6. app2.example.com获取ticket去认证中心验证是否有效。
7. 认证成功。
8. 创建对应的SESSION，返回Cookie值SESSIONID。
9. 展示相关资源到用户浏览器上。

用户第一次访问app2资源

![cas-app2](https://spcookie.oss-cn-hangzhou.aliyuncs.com/cas-app2-2024-07-29.jpg)

1. 用户请求app2.example.com，发现第一次访问，于是给他一个重定向的地址，让他去找认证中心（CAS server）登录。
2. app2.example.com发现用户没有登录（没有Cookie: SESSIONID），则返回浏览器重定向地址并且通过get的方式添加参数service，该参数目的是登录成功之后会要重定向回来。
3. 浏览器发起重定向，因为之前访问过一次了，因此这次会携带上次返回的Cookie：TGC到认证中心。
4. 认证中心收到请求，发现TGC对应了一个TGT，于是用TGT签发一个ST(ticket)，并且返回给浏览器，让他重定向到app2.example.com。
5. 浏览器根据返回的网址（app2.example.com?ticket=ST-7-GfpdKd.....）发起重定向。
6. app2.example.com获取ticket去认证中心验证是否有效。
7. 认证成功。
8. 创建对应的SESSION，返回Cookie值SESSIONID。
9. 展示相关资源到用户浏览器上。

##  CAS安全性

CAS的安全性仅仅依赖于SSL 。使用的是`secure cookie` 。

### TGC安全性

对于一个CAS用户来说，最重要是要保护它的TGC ，如果TGC不慎被CAS Server以外的实体获得， Hacker能够找到该 TGC，然后冒充CAS用户访问 **所有**授权资源。

从基础模式可以看出，TGC是CAS Server通过SSL方式发送给终端用户，因此，要截取TGC难度非常大，从而确保CAS的安全性。

TGT的存活周期默认为120分钟。

### ST安全性

ST（ Service Ticket ）是通过HTTP传送的，因此网络中的其他人可以Sniffer到其他人的Ticket 。CAS通过以下几方面来使ST变得更加安全（事实上都是可以配置的）：

1.  ST只能使用一次

CAS协议规定，无论Service Ticket验证是否成功，CAS Server都会清除服务端缓存中的该Ticket ，从而可以确保一个 Service Ticket不被使用两次。

2.  ST在一段时间内失效

CAS规定ST只能存活一定的时间，然后CAS Server会让它失效。默认有效时间为5分钟。

3. ST是基于随机数生成的

ST必须足够随机，如果ST生成规则被猜出，Hacker就等于绕过CAS认证，直接访问对应的服务。