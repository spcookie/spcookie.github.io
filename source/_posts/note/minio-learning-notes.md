---
title: MinIO学习笔记
categories: [ 笔记 ]
tags: [ storage ]
comments: false
keywords:
description:
author: Spcookie
group: default
date: 2023/9/21 13:15:00
updated: 2023/9/21 13:15:00
readmore: false
---

# MinIO学习笔记

* 👉[中文文档（有点过时了）](https://minio.org.cn/index4.shtml)

* 👉[官方文档（部分中文）](https://www.minio.org.cn/docs/minio/linux/index.html)

## 概述

> `MinIO` 是在 `GNU Affero` 通用公共许可证 v3.0 下发布的**高性能对象存储**。它与 Amazon S3 云存储服务 API 兼容。使用 MinIO
> 为机器学习、分析和应用程序数据工作负载构建高性能基础架构。

特点：

* **数据保护**
  ——分布式Minio采用纠删码来防范多个节点宕机和[位衰减](https://baike.baidu.com/item/%E4%BD%8D%E8%A1%B0%E5%87%8F)bit
  rot。分布式Minio至少需要4个硬盘，使用分布式Minio自动引入了纠删码功能。

* **高可用**——单机Minio服务存在单点故障，相反，如果是一个有N块硬盘的分布式Minio,只要有N/2硬盘在线，你的数据就是安全的。不过你需要至少有N/2+1个硬盘来创建新的对象。

* **一致性**——Minio在分布式和单机模式下，所有读写操作都严格遵守read-after-write一致性模型。

MinIO的优点如下：

* **部署简单**，一个二进制文件（minio）即是一切，还可以支持各种平台。

* **支持海量存储**，可以按zone扩展，支持单个对象最大5TB。

* **低冗余且磁盘损坏高容忍**，标准且最高的数据冗余系数为2(即存储一个1M的数据对象，实际占用磁盘空间为2M)
  。但在任意n/2块disk损坏的情况下依然可以读出数据(n为一个纠删码集合中的disk数量)。并且这种损坏恢复是基于单个对象的，而不是基于整个存储卷的。

* **读写性能优异**

## MinIO 基础概念

* `S3`——Simple Storage Service，简单存储服务，这个概念是Amazon在2006年推出的，对象存储就是从那个时候诞生的。S3提供了一个简单Web服务接口，可用于随时在Web上的任何位置存储和检索任何数量的数据。

* `Object`——存储到 Minio 的基本对象，如文件、字节流，Anything...

* `Bucket`——用来存储 Object 的逻辑空间。每个 Bucket 之间的数据是相互隔离的。

* `Drive`——部署 Minio 时设置的磁盘，Minio 中所有的对象数据都会存储在 Drive 里。

* `Set`——一组 Drive 的集合，分布式部署根据集群规模自动划分一个或多个 Set ，每个 Set 中的 Drive 分布在不同位置。

    * 一个对象存储在一个Set上。

    * 一个集群划分为多个Set。

    * 一个Set包含的Drive数量是固定的，默认由系统根据集群规模自动计算得出。

    * 一个SET中的Drive尽可能分布在不同的节点上。

## Set /Drive 的关系

* Set /Drive 这两个概念是 MINIO 里面最重要的两个概念，一个对象最终是存储在 Set 上面的。

* Set 是另外一个概念，Set 是一组 Drive 的集合。

## 纠删码（Erasure Code）

> 纠删码（Erasure Code）简称EC，是一种数据保护方法，它将数据分割成片段，把冗余数据块扩展、编码，并将其存储在不同的位置，比如磁盘、存储节点或者其它地理位置。

* 纠删码是一种恢复丢失和损坏数据的数学算法，目前，纠删码技术在分布式存储系统中的应用主要有三类，**阵列纠删码（Array Code:
  RAID5、RAID6等）**、**RS(Reed-Solomon)里德-所罗门类纠删码**和**LDPC(LowDensity Parity Check Code)低密度奇偶校验纠删码**。

* Erasure Code是一种编码技术，它可以将n份原始数据，增加m份校验数据，并能通过n+m份中的任意n份原始数据，还原为原始数据。

* 即如果有任意小于等于m份的校验数据失效，仍然能通过剩下的数据还原出来。

* Minio采用Reed-Solomon code将对象拆分成N/2数据和N/2 **奇偶校验块**。

* 在同一集群内，MinIO 自己会自动生成若干纠删组（Set），用于分布存放桶数据。一个纠删组中的一定数量的磁盘发生的故障（故障磁盘的数量小于等于校验盘的数量），通过纠删码校验算法可以恢复出正确的数据。
