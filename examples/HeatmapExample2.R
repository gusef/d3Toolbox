require(Biobase)
require(RColorBrewer)
require(d3Toolbox)
require(gplots)

ui <- fillPage(fillRow(
  d3CollectionOutput("heatmap", width = "100%", height = "100%"),
  fillCol(
    h3(verbatimTextOutput("currentOutput")),
    plotOutput("filterpanel", width = "100%", height = "100%")
  ),flex = c(2,1))
  ,tags$head(tags$script(src="d3-toolbox.js"))
  ,tags$head(tags$script(src="d3Collection.js"))
)

server <- function(input, output, session) {

    output$heatmap <- renderd3Collection({
        #dir <- '/Users/Daniel Gusenleitner/Dropbox (Personal)/Hephaestus/data/'
        dir <- '/Users/gusef/Dropbox (Personal)/Hephaestus/data/'

        eSet <- readRDS(paste0(dir,'RNAseq_nodedup_cpm.RDS'))
        eSet <- eSet[,eSet$Visit.Code == "SCREEN"]

        #fix genes
        genes <- as.character(read.csv(paste0(dir,'genes.txt'))[,1])
        eSet <- eSet[rowSums(exprs(eSet)) >0, ]
        exprs(eSet) <- log2(exprs(eSet) + 1)
        eSet <- eSet[fData(eSet)$hgnc_symbol %in% genes,]
        rownames(eSet) <- fData(eSet)$hgnc_symbol

        #fix labels
        eSet$BORI[eSet$BORI=='NE'] <- NA
        eSet$BORI <- droplevels(eSet$BORI)
        colnames(eSet) <- eSet$SUBJID

        #top dendrogram
        hc01.col <- hcopt(dist(t(exprs(eSet))),method="ward.D")
        top_dend <- as.dendrogram(hc01.col)

        #left dendrogram
        hc01.row <- hcopt(as.dist(1-cor(t(exprs(eSet)))),method="ward.D")
        left_dend <- as.dendrogram(hc01.row)

        #Color bar
        topbar <- rbind(c('#2ca25f','#f03b20','#99d8c9','#ffeda0')[as.numeric(eSet$BORI)],
                        c('#f03b20','#99d8c9','#ffeda0')[as.numeric(eSet$RESW13I)])
        colnames(topbar) <- colnames(eSet)
        rownames(topbar) <- c('BORI','RESW13I')

        heatmap.d3(x = exprs(eSet),
                  scale='row',
                  col = RColorBrewer::brewer.pal(11,"RdBu")[11:1],
                  ColSideColors = topbar,
                  Rowv = left_dend,
                  Colv = top_dend,
                  main = 'Third d3Heatmap prototype')

    })

    output$filterpanel <- renderPlot({
        #dir <- '/Users/Daniel Gusenleitner/Dropbox (Personal)/Hephaestus/data/'
        dir <- '/Users/gusef/Dropbox (Personal)/Hephaestus/data/'

        eSet <- readRDS(paste0(dir,'RNAseq_nodedup_cpm.RDS'))
        eSet <- eSet[,eSet$Visit.Code == "SCREEN"]

        #fix genes
        genes <- as.character(read.csv(paste0(dir,'genes.txt'))[,1])
        eSet <- eSet[rowSums(exprs(eSet)) >0, ]
        exprs(eSet) <- log2(exprs(eSet) + 1)
        eSet <- eSet[fData(eSet)$hgnc_symbol %in% genes,]
        rownames(eSet) <- fData(eSet)$hgnc_symbol

        #fix labels
        eSet$BORI[eSet$BORI=='NE'] <- NA
        eSet$BORI <- droplevels(eSet$BORI)
        colnames(eSet) <- eSet$SUBJID

        #top dendrogram
        hc01.col <- hcopt(dist(t(exprs(eSet))),method="ward.D")
        top_dend <- as.dendrogram(hc01.col)

        #left dendrogram
        hc01.row <- hcopt(as.dist(1-cor(t(exprs(eSet)))),method="ward.D")
        left_dend <- as.dendrogram(hc01.row)

        heatmap.2(x = exprs(eSet),
                  scale='row',
                  col = RColorBrewer::brewer.pal(11,"RdBu")[11:1],
                  ColSideColors = c('#2ca25f','#f03b20','#99d8c9','#ffeda0')[as.numeric(eSet$BORI)],
                  Rowv = left_dend,
                  Colv = top_dend,
                  trace = 'none',
                  main= 'gplots heatmap.2')
    })

    output$currentOutput <- renderPrint({ print(input$collection_callback) })

}

shinyApp(ui, server)
