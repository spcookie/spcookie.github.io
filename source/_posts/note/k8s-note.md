---
title: k8s学习笔记
categories: [ 笔记 ]
tags: [ kubernetes ]
author: Spcookie
group: default
comments: true
readmore: false
references:
  - title: 免费Kubernetes教程 - Kuboard
    url: https://www.kuboard.cn/learning/
keywords: [k8s, kubernetes]
description: k8s学习笔记
indent: true
---

Kubernetes是一个可以移植、可扩展的开源平台，使用 声明式的配置 并依据配置信息自动地执行容器化应用程序的管理。

<!-- more -->

## Kubernetes组件

### Master组件

> Master组件是集群的控制平台
> - master 组件负责集群中的全局决策
> - master 组件探测并响应集群事件

#### kube-apiserver

提供 Kubernetes API。这是Kubernetes控制平台的前端。

#### etcd

支持一致性和高可用的名值对存储组件，Kubernetes 集群的所有配置信息都存储在 etcd 中。

#### kube-scheduler

监控所有新创建尚未分配到节点上的 Pod，并且自动选择为 Pod 选择一个合适的节点去运行。

#### kube-controller-manager

运行所有的控制器。逻辑上来说，每一个控制器是一个独立的进程，但是为了降低复杂度，这些控制器都被合并运行在一个进程里。

kube-controller-manager 中包含的控制器有：

- 节点控制器： 负责监听节点停机的事件并作出对应响应
- 副本控制器： 负责为集群中每一个 副本控制器对象（Replication Controller Object）维护期望的 Pod 副本数
- 端点（Endpoints）控制器：负责为端点对象（Endpoints Object，连接 Service 和 Pod）赋值
- Service Account & Token控制器： 负责为新的名称空间创建 default Service Account 以及 API Access Token

#### cloud-controller-manager

cloud-controller-manager 中运行了与具体云基础设施供应商互动的控制器。cloud-controller-manager 只运行特定于云基础设施供应商的控制器。

cloud-controller-manager 使得云供应商的代码和 Kubernetes 的代码可以各自独立的演化。在此之前的版本中，Kubernetes的核心代码是依赖于云供应商的代码的。在后续的版本中，特定于云供应商的代码将由云供应商自行维护，并在运行Kubernetes时链接到 cloud-controller-manager。

以下控制器中包含与云供应商相关的依赖：

- 节点控制器：当某一个节点停止响应时，调用云供应商的接口，以检查该节点的虚拟机是否已经被云供应商删除
> 私有化部署Kubernetes时，我们不知道节点的操作系统是否删除，所以在移除节点后，要自行通过 kubectl delete node 将节点对象从 Kubernetes 中删除

- 路由控制器：在云供应商的基础设施中设定网络路由
> 私有化部署Kubernetes时，需要自行规划Kubernetes的拓扑结构，并做好路由配置

- 服务（Service）控制器：创建、更新、删除云供应商提供的负载均衡器
> 私有化部署Kubernetes时，不支持 LoadBalancer 类型的 Service，如需要此特性，需要创建 NodePort 类型的 Service，并自行配置负载均衡器

- 数据卷（Volume）控制器：创建、绑定、挂载数据卷，并协调云供应商编排数据卷
> 私有化部署Kubernetes时，需要自行创建和管理存储资源，并通过Kubernetes的存储类、存储卷、数据卷等与之关联

通过 cloud-controller-manager，Kubernetes可以更好地与云供应商结合，例如，在阿里云的 Kubernetes 服务里，您可以在云控制台界面上轻松点击鼠标，即可完成 Kubernetes 集群的创建和管理。在私有化部署环境时，您必须自行处理更多的内容。

### Node组件

> Node 组件运行在每一个节点上（包括 master 节点和 worker 节点），负责维护运行中的 Pod 并提供 Kubernetes 运行时环境。

#### kubelet

此组件是运行在每一个集群节点上的代理程序。它确保 Pod 中的容器处于运行状态。Kubelet 通过多种途径获得 PodSpec 定义，并确保 PodSpec 定义中所描述的容器处于运行和健康的状态。Kubelet不管理不是通过 Kubernetes 创建的容器。

#### kube-proxy

一个网络代理程序，运行在集群中的每一个节点上，是实现 Kubernetes Service 概念的重要部分。kube-proxy 在节点上维护网络规则。这些网络规则使得您可以在集群内、集群外正确地与 Pod 进行网络通信。如果操作系统中存在 packet filtering layer，kube-proxy 将使用这一特性[iptables代理模式](/k8s-note/#)，否则，kube-proxy将自行转发网络请求[User Space代理模式](/k8s-note/#)。

#### 容器引擎

容器引擎负责运行容器。Kubernetes支持多种容器引擎：Docker、containerd、cri-o、rktlet以及任何实现了 Kubernetes容器引擎接口的容器引擎。

### Addons

Addons 使用 Kubernetes 资源（DaemonSet、Deployment等）实现集群的功能特性。由于他们提供集群级别的功能特性，addons使用到的Kubernetes资源都放置在 `kube-system` 名称空间下。

#### DNS

除了 DNS Addon 以外，其他的 addon 都不是必须的，所有 Kubernetes 集群都应该有 Cluster DNS。Cluster DNS 是一个 DNS 服务器，是对您已有环境中其他 DNS 服务器的一个补充，存放了 Kubernetes Service 的 DNS 记录。Kubernetes 启动容器时，自动将该 DNS 服务器加入到容器的 DNS 搜索列表中。

#### Web UI（Dashboard）

Dashboard是一个Kubernetes集群的 Web 管理界面。用户可以通过该界面管理集群。

#### Kuboard

Kuboard 是一款基于Kubernetes的微服务管理界面，相较于 Dashboard，Kuboard 强调：

- 无需手工编写 YAML 文件
- 微服务参考架构
- 上下文相关的监控
- 场景化的设计
  - 导出配置
  - 导入配置

## k8s Cluster

{% image ./k8s-jq.svg::width=640px %}

拥有一个Master(主)节点和六个Worker(工作)节点的k8s集群。

{% image ./k8s-cluster.svg::width=500px %}

Master 负责管理集群 负责协调集群中的所有活动，例如调度应用程序，维护应用程序的状态，扩展和更新应用程序。

Worker节点(即图中的Node)是VM(虚拟机)或物理计算机，充当k8s集群中的工作计算机。 每个Worker节点都有一个Kubelet，它管理该Worker节点并负责与Master节点通信。该Worker节点还应具有用于处理容器操作的工具，例如Docker。

## k8s Node

### 节点概述

Kubernetes中节点（node）指的是一个工作机器，曾经叫做 `minion`。不同的集群中，节点可能是虚拟机也可能是物理机。每个节点都由 master 组件管理，并包含了运行 Pod（容器组）所需的服务。这些服务包括：

- 容器引擎
- kubelet
- kube-proxy

下图显示一个 Node（节点）上含有4个 Pod（容器组）

{% image ./k8s-nodes.svg::width=480px %}

Pod（容器组）总是在 **Node（节点）**上运行。Node（节点）是 kubernetes 集群中的计算机，可以是虚拟机或物理机。每个 Node（节点）都由 master 管理。一个 Node（节点）可以有多个Pod（容器组），kubernetes master 会根据每个 Node（节点）上可用资源的情况，自动调度 Pod（容器组）到最佳的 Node（节点）上。

每个 Kubernetes Node（节点）至少运行：

- Kubelet，负责 master 节点和 worker 节点之间通信的进程；管理 Pod（容器组）和 Pod（容器组）内运行的 Container（容器）。
- 容器运行环境（如Docker）负责下载镜像、创建和运行容器等。

### 节点状态

节点的状态包含如下信息：

- Addresses
- Conditions
- Capacity and Allocatable
- Info

执行以下命令可查看所有节点的列表：

```sh
kubectl get nodes -o wide
```

执行以下命令可查看节点状态以及节点的其他详细信息：

```sh
kubectl describe node <your-node-name>
```

#### Addresses

依据集群部署的方式（在哪个云供应商部署，或是在物理机上部署），Addesses 字段可能有所不同。

- HostName： 在节点命令行界面上执行 `hostname` 命令所获得的值。启动 kubelet 时，可以通过参数 `--hostname-override` 覆盖
- ExternalIP：通常是节点的外部IP（可以从集群外访问的内网IP地址）
- InternalIP：通常是从节点内部可以访问的 IP 地址

#### Conditions

Conditions 描述了节点的状态。Condition的例子有：
|Node Condition|描述|
|---|---|
|OutOfDisk|如果节点上的空白磁盘空间不够，不能够再添加新的节点时，该字段为 `True`，其他情况为 `False`|
|Ready|如果节点是健康的且已经就绪可以接受新的 Pod。则节点Ready字段为 `True`。`False` 表明了该节点不健康，不能够接受新的 Pod|
|MemoryPressure|如果节点内存紧张，则该字段为 `True`，否则为 `False`|
|PIDPressure|如果节点上进程过多，则该字段为 `True`，否则为 `False`|
|DiskPressure|如果节点磁盘空间紧张，则该字段为 `True`，否则为 `False`|
|NetworkUnvailable|如果节点的网络配置有问题，则该字段为 `True`，否则为 `False`|

#### Capacity and Allocatable

容量和可分配量（Capacity and Allocatable）描述了节点上的可用资源的情况：

- CPU
- 内存
- 该节点可调度的最大 pod 数量

Capacity 中的字段表示节点上的资源总数，Allocatable 中的字段表示该节点上可分配给普通 Pod 的资源总数。

#### Info

描述了节点的基本信息，例如：

- Linux 内核版本
- Kubernetes 版本（kubelet 和 kube-proxy 的版本）
- Docker 版本
- 操作系统名称

这些信息由节点上的 kubelet 收集。

## k8s Deployment

### Deployment概述

在 k8s 上进行部署前，首先需要了解一个基本概念 Deployment

Deployment 译名为 部署。在k8s中，通过发布 Deployment，可以创建应用程序 (docker image) 的实例 (docker container)，这个实例会被包含在称为 Pod 的概念中，Pod 是 k8s 中最小可管理单元。

在 k8s 集群中发布 Deployment 后，Deployment 将指示 k8s 如何创建和更新应用程序的实例，master 节点将应用程序实例调度到集群中的具体的节点上。

创建应用程序实例后，Kubernetes Deployment Controller 会持续监控这些实例。如果运行实例的 worker 节点关机或被删除，则 Kubernetes Deployment Controller 将在群集中资源最优的另一个 worker 节点上重新创建一个新的实例。这提供了一种自我修复机制来解决机器故障或维护问题。

{% image ./k8s-first-app.svg::width=480px %}

Deployment 处于 master 节点上，通过发布 Deployment，master 节点会选择合适的 worker 节点创建 Container（即图中的正方体），Container 会被包含在 Pod （即蓝色圆圈）里。

### 部署Nginx Deployment

1. 创建 YAML 文件

创建文件 `nginx-deployment.yaml`

```yaml
apiVersion: apps/v1	#与k8s集群版本有关，使用 kubectl api-versions 即可查看当前集群支持的版本
kind: Deployment	#该配置的类型，我们使用的是 Deployment
metadata:	        #译名为元数据，即 Deployment 的一些基本属性和信息
  name: nginx-deployment	#Deployment 的名称
  labels:	    #标签，可以灵活定位一个或多个资源，其中key和value均可自定义，可以定义多组，目前不需要理解
    app: nginx	#为该Deployment设置key为app，value为nginx的标签
spec:	        #这是关于该Deployment的描述，可以理解为你期待该Deployment在k8s中如何使用
  replicas: 1	#使用该Deployment创建一个应用程序实例
  selector:	    #标签选择器，与上面的标签共同作用，目前不需要理解
    matchLabels: #选择包含标签app:nginx的资源
      app: nginx
  template:	    #这是选择或创建的Pod的模板
    metadata:	#Pod的元数据
      labels:	#Pod的标签，上面的selector即选择包含标签app:nginx的Pod
        app: nginx
    spec:	    #期望Pod实现的功能（即在pod中部署）
      containers:	#生成container，与docker中的container是同一种
      - name: nginx	#container的名称
        image: nginx:1.7.9	#使用镜像nginx:1.7.9创建container，该container默认80端口可访问
```

2. 应用 YAML 文件

```sh
kubectl apply -f nginx-deployment.yaml
```

### 伸缩应用程序

#### Scaling 概述

下图中，Service A 只将访问流量转发到 IP 为 10.0.0.5 的Pod上。

{% image ./k8s-scaling1.svg::width=480px %}

修改了 Deployment 的 replicas 为 4 后，Kubernetes 又为该 Deployment 创建了 3 新的 Pod，这 4 个 Pod 有相同的标签。因此Service A通过标签选择器与新的 Pod 建立了对应关系，将访问流量通过负载均衡在 4 个 Pod 之间进行转发。

{% image ./k8s-scaling2.svg::width=480px %}

> 通过更改部署中的 replicas（副本数）来完成扩展

#### 将 Nginx Deployment 扩容

1. 修改 `nginx-deployment.yaml` 文件

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 4
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.7.9
        ports:
        - containerPort: 80
```

2. 执行命令

```sh
kubectl apply -f nginx-deployment.yaml
```

## k8s Pod

创建 Deployment 后，k8s创建了一个 Pod（容器组）来放置应用程序实例（container 容器）。

### Pod概述

{% image ./k8s-pods.svg::width=480px %}

**Pod 容器组** 是一个k8s中一个抽象的概念，用于存放一组 container（可包含一个或多个 container 容器，即图上正方体），以及这些 container （容器）的一些共享资源。这些资源包括：

- 共享存储，称为卷(Volumes)，即图上紫色圆柱
- 网络，每个 Pod（容器组）在集群中有个唯一的 IP，pod（容器组）中的 container（容器）共享该IP地址
- container（容器）的基本信息，例如容器的镜像版本，对外暴露的端口等

Pod（容器组）是 k8s 集群上的最基本的单元。当我们在 k8s 上创建 Deployment 时，会在集群上创建包含容器的 Pod (而不是直接创建容器)。每个Pod都与运行它的 worker 节点（Node）绑定，并保持在那里直到终止或被删除。如果节点（Node）发生故障，则会在群集中的其他可用节点（Node）上运行相同的 Pod（从同样的镜像创建 Container，使用同样的配置，IP 地址不同，Pod 名字不同）。

{% noteblock warning red:: 重要 %}
- Pod 是一组容器（可包含一个或多个应用程序容器），以及共享存储（卷 Volumes）、IP 地址和有关如何运行容器的信息。
- 如果多个容器紧密耦合并且需要共享磁盘等资源，则他们应该被部署在同一个Pod（容器组）中。
{% endnoteblock %}

## k8s Service

### Service概述

Pod 有自己的**生命周期**。当 worker node 故障时，节点上运行的 Pod 也会消失。然后，Deployment 可以通过创建新的 Pod 来动态地将群集调整回原来的状态，以使应用程序保持运行。

Kubernetes 中的 **Service** 提供了这样的一个抽象层，它选择具备某些特征的 Pod（容器组）并为它们定义一个访问方式。Service（服务）使 Pod（容器组）之间的相互依赖解耦（原本从一个 Pod 中访问另外一个 Pod，需要知道对方的 IP 地址）。一个 Service（服务）选定哪些 **Pod（容器组）** 通常由 **LabelSelector(标签选择器)** 来决定。

在创建Service的时候，通过设置配置文件中的 `spec.type` 字段的值，可以以不同方式向外部暴露应用程序：

- ClusterIP（默认）
在群集中的内部IP上公布服务，这种方式的 Service（服务）只在集群内部可以访问到。

- NodePort
使用 NAT 在集群中每个的同一端口上公布服务。这种方式下，可以通过访问集群中任意节点+端口号的方式访问服务 `<NodeIP>:<NodePort>`。此时 ClusterIP 的访问方式仍然可用。

- LoadBalancer
在云环境中（需要云供应商可以支持）创建一个集群外部的负载均衡器，并为使用该负载均衡器的 IP 地址作为服务的访问地址。此时 ClusterIP 和 NodePort 的访问方式仍然可用。

> Service是一个抽象层，它通过 LabelSelector 选择了一组 Pod（容器组），把这些 Pod 的指定端口公布到到集群外部，并支持负载均衡和服务发现。
> - 公布 Pod 的端口以使其可访问
> - 在多个 Pod 间实现负载均衡
> - 使用 Label 和 LabelSelector

### 服务和标签

下图中有两个服务Service A(黄色虚线)和Service B(蓝色虚线) Service A 将请求转发到 IP 为 10.10.10.1 的Pod上， Service B 将请求转发到 IP 为 10.10.10.2、10.10.10.3、10.10.10.4 的Pod上。

{% image ./k8s-services.svg::width=480px %}

Service 将外部请求路由到一组 Pod 中，它提供了一个抽象层，使得 Kubernetes 可以在不影响服务调用者的情况下，动态调度容器组{% span gray::（在容器组失效后重新创建容器组，增加或者减少同一个 Deployment 对应容器组的数量等） %}。

Service使用 Labels、LabelSelector(标签和选择器) 匹配一组 Pod。Labels（标签）是附加到 Kubernetes 对象的键/值对，其用途有多种：

- 将 Kubernetes 对象（Node、Deployment、Pod、Service等）指派用于开发环境、测试环境或生产环境
- 嵌入版本标签，使用标签区别不同应用软件版本
- 使用标签对 Kubernetes 对象进行分类

下图体现了 Labels（标签）和 LabelSelector（标签选择器）之间的关联关系

- Deployment B 含有 LabelSelector 为 app=B {% span gray::通过此方式声明含有 app=B 标签的 Pod 与之关联 %} 
- 通过 Deployment B 创建的 Pod 包含标签为 app=B
- Service B 通过标签选择器 app=B 选择可以路由的 Pod

{% image ./k8s-labels.svg::width=480px %}

> Labels（标签）可以在创建 Kubernetes 对象时附加上去，也可以在创建之后再附加上去。任何时候都可以修改一个Kubernetes 对象的 Labels（标签）

### 为 Nginx Deployment 创建一个 Service

1. 创建文件 `nginx-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service	#Service 的名称
  labels:     	#Service 自己的标签
    app: nginx	#为该 Service 设置 key 为 app，value 为 nginx 的标签
spec:	    #这是关于该 Service 的定义，描述了 Service 如何选择 Pod，如何被访问
  selector:	    #标签选择器
    app: nginx	#选择包含标签 app:nginx 的 Pod
  ports:
  - name: nginx-port	#端口的名字
    protocol: TCP	    #协议类型 TCP/UDP
    port: 80	        #集群内的其他容器组可通过 80 端口访问 Service
    nodePort: 32600   #通过任意节点的 32600 端口访问 Service
    targetPort: 80	#将请求转发到匹配 Pod 的 80 端口
  type: NodePort	#Serive的类型，ClusterIP/NodePort/LoaderBalancer
```

2. 执行命令

```sh
kubectl apply -f nginx-service.yaml
```

