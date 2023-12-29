---
title: 🌟如何拥有自己的ChatGPT
categories: [ 教程 ]
tags: [ technology ]
comments: false
keywords:
description:
author: Spcookie
group: default
date: 2023/12/15 13:14:00
updated: 2023/12/15 13:14:00
readmore: false
---

魔法上网 👉 Github 👉 Vercel
简单小教程，5分钟部署一个属于自己的ChatGPT

<!-- more -->

## 准备魔法上网工具

### 安装

这里推荐小猫咪`Clash`

| 平台 | 下载链接 |
| --- | --- |
| Windows | [Clash for Window](https://qingyun.filebases.com/assets/Clash.for.Windows-0.20.25-win.7z) |
| Mac | [Clash for Mac](https://qingyun.filebases.com/assets/Clash.for.Windows-0.20.25.dmg) |

### 订阅

安装好`Clash`后，需要有节点的订阅地址，这里不提供节点，请自行百度
获取订阅地址链接后，点击`Clash`的`Profiles`，粘贴链接进行`Download`

### 代理

- 导入节点后，配置`Profiles`选择刚刚导入的配置
- 代理`Proxies`选择顶部规则`Rule`，选择代理区域
- 选择`General`然后打开`System Proxy`

{% note quote::后续操作都需要开启代理 %}

## 注册一个GitHub帐号

[GitHub官网链接](https://github.com)

- 点击右上角Sing Up使用邮箱注册
- 登陆GitHub

## 登陆Vercel

[Vercel官网链接](https://vercel.com)

- 点击右上角Log In
- 选择Continue with GitHub进行登陆
- 此时会弹出一个GitHub认证的弹窗，点击Authentication

## 获得一个密钥

> 密钥：apikey 相当于访问gpt的身份证号
> 令牌：token 相当于消耗的字数（gpt每次理解或生成文字都需要消耗令牌）
> 一个apikey会有一定额度的token

某宝可以自行采购，下一步会用到，关键词`apikey`，一般是5米，会发给你一个`sk-`开头的英文字符串密钥

## 部署网站

- 点击[ChatGPT-Next-Web](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&project-name=chatgpt-next-web&repository-name=ChatGPT-Next-Web)
-  开始部署应用
   - 在Create Git Repository卡片中直接点击Create
   - 在Configure Project卡片中，填入`OPENAI_API_KEY`和`CODE`分别是apikey和网站登录密码，然后点击Deploy
- 等待几分钟部署完成
- 点击Visit，即可访问网站

> 快捷访问gpt只需要将浏览器顶部的链接保存，后续输入该链接就可以访问

## 使用ChatGPT

### 登录

输入上一步配置的密码`CODE`即可登录

### 修改设置

点击左下角的小齿轮打开设置页面
需要注意的几个设置有
|属性|解释|
| --- | --- |
| 模型（model） | `gpt-4-*` > `gpt=3.5-*` > `gpt-3.5-turbo-16k-0613`>`gpt-3.5-turbo-16k`>`gpt-3.5-turbo-0613`>`gpt-3。5-turbo` |
| 附带的历史消息数 | 这个是gpt可以理解的上下文范围，数值越大gpt就能记住越多的历史对话，同时消耗的令牌也会增大 |
| 单次回复限制（max_tokens） | 数值越大gpt一次回答的字数越多，若设置的太小，则回答可能会因为限制而截断 |





