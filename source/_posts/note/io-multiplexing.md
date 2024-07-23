---
title: IO多路复用-select、poll、epoll机制与区别
categories: [ 开发笔记 ]
tags: [ kernel ]
comments: false
keywords:
description:
author: Spcookie
group: default
date: 2023/9/15 13:15:00
updated: 2023/9/15 13:15:00
readmore: false
---

select、poll 以及 epoll 是 Linux 系统的三个系统调用，也是 IO 多路复用模型的具体实现。

<!-- more -->

## 整理几篇文章

* [https://blog.csdn.net/adminpd/article/details/124553590](https://blog.csdn.net/adminpd/article/details/124553590)
* [https://blog.csdn.net/wteruiycbqqvwt/article/details/90299610](https://blog.csdn.net/wteruiycbqqvwt/article/details/90299610)